from flask import Flask, request, render_template, redirect, session, flash, jsonify
from mysqlconnection import MySQLConnection
from flask_bcrypt import Bcrypt
import re


app = Flask(__name__)
app.secret_key = open('secret_key.txt', 'r').read().strip()


db = MySQLConnection(app, 'wall')
bcrypt = Bcrypt(app)


@app.route('/')
def home():
	if 'login' not in session:
		session['login'] = False

	if session['login']:
		return redirect('/wall')
	else:
		return redirect('/login')

@app.route('/wall')
def wall():
	message_query = "select a.id, user_id, a.created_at, content, \
	 concat(first_name,' ',last_name) as user_name \
	from messages as a \
	join users as b\
	 on a.user_id = b.id\
	order by a.created_at desc"

	messages = db.query_db(message_query)

	return render_template('wall.html', 
	 first_name=session['first_name'],
	 messages = messages,
	 user_id = session['user_id'])


@app.route('/login')
def login():
	return render_template('login.html')


@app.route('/process-login', methods=['POST'])
def process_login():
	email = request.form['email']
	password = request.form['password']
	
	# first see if this user exists in the database
	user = db.query_db('select id, email, first_name, password from users \
		where email = :email', {'email': email})

	if len(user) > 0:
		# the user exists, now check they've supplied the correct password
		user = user[0]
		if bcrypt.check_password_hash(user['password'], password):
			# vaild email and password supplied
			session['login'] = True
			session['first_name'] = user['first_name']
			session['user_id'] = user['id']
		else:
			session['login'] = False
			flash('Password is not correct.', 'login-error')
	else:
		flash('No user found with this email.', 'login-error')

	return redirect('/')



@app.route('/register')
def register():
	return render_template('register.html')

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9\.\+_-]+@[a-zA-Z0-9\._-]+\.[a-zA-Z]*$')

@app.route('/process-registration', methods=['POST'])
def process_registration():
	email = request.form['email']
	first_name = request.form['first_name']
	last_name = request.form['last_name']
	password = request.form['password']
	password2 = request.form['password2']
	
	session['register'] = False

	# check email is valid, username doesnt already exist
	user = db.query_db('select 1 from users where email = :email',
		{'email': email })
	if len(user) > 0:
		session['register'] = True
		flash('Account already exists with this email. Please log in.', 
			'registration-error')
		return redirect('/register')

	errors = []
	if not EMAIL_REGEX.match(email):
		errors.append('Invalid email format.')

	if len(first_name) < 3 or len(last_name) < 3:
		errors.append('First and last name must have at least 2 characters.')
	
	if len(password) < 8:
		errors.append('Password must be at least 8 characteres.')
	elif password != password2:
		errors.append('Passwords do not match.')
	
	for error in errors:
		flash(error, 'registration-error')

	if len(errors) > 0:
		return redirect('/register')

	# insert into db
	pw_encrypt = bcrypt.generate_password_hash(password)
	
	query = 'insert into users (email, first_name, last_name, password) \
	values(:email, :first_name, :last_name, :pw_encrypt)'
	params = {'first_name': first_name, 'last_name': last_name,
		'email': email, 'pw_encrypt': pw_encrypt}

	db.query_db(query, params)

	flash('Account created successfully. You may now log in.', 'registration-success')
	return redirect('/login')


@app.route('/logout')
def logout():
	session['login'] = False
	return redirect('/')

@app.route('/add-message', methods=['POST'])
def add_message():
	query = 'insert into messages(user_id, content) \
	values(:user_id, :content)'
	
	data =  {
		'user_id': session['user_id'],
		'content': request.form.get('content') 
	}
	try:
		result = db.query_db(query, data)	
	except Exception as err:
		flash('Message not added, with error: ' + str(err))
	return redirect('/')

@app.route('/update-message', methods=['POST'])
def update_message():
	# print (request.form)
	query = 'update messages set content=:content \
	where id=:id';
	params = {
		'content': request.form.get('content'),
		'id': request.form.get('id')
	}
	try:
		db.query_db(query, params)
		return '0'
	except Exception as err:
		return 'Error updating message, with error: '+str(err)


@app.route('/delete-message', methods=['POST'])
def delete_message():
	
	query = 'delete from messages \
	where id=:id';
	params = {
		'id': request.form.get('id')
	}
	try:
		db.query_db(query, params)
		return '0'
	except Exception as err:
		return 'Error updating message, with error: '+str(err)



"""
@app.route('/get-content')
def get_content():
	message_query = "select a.id as message_id, user_id, a.created_at, content, \
	 concat(first_name,' ',last_name) as user_name \
	from messages as a \
	join users as b\
	 on a.user_id = b.id\
	order by a.created_at desc"

	messages = db.query_db(message_query)

	return jsonify(messages)
"""

app.run(debug=True)
