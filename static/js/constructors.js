
function controlsHtml(){
	return '<div class="controls">\
		<i class="fa fa-pencil top"></i>\
		<i class="fa fa-trash bottom"></i>\
		</div>'
}

function ncommText(n){
	if(n==1){
		comm= 'Comment'
	}else{
		comm = 'Comments';
	}
	return '&rsaquo; '+n+' '+comm;
}
function populateMessage(mid, user_name, created_at, content, ncomments, canedit=true){
	var message = $('.message[mid='+mid+']');
	message.append('<div class="msg-text"></div>');
	var msg_text = message.children('.msg-text');

	msg_text.append('<h4>'+user_name+' on '+created_at+'</h4>');
	msg_text.append('<p>'+content+'</p>');
	if (canedit){ 
		msg_text.append(controlsHtml());
	}
	msg_text.append('<a href="#" n='+ncomments+'>'+ncommText(ncomments)+'</a>');
}
function populateComment(cid, user_name, created_at, content, canedit=true){
	//var comments = $('.comment[mid='+mid+']');
	var comment = $('.comment[cid='+cid+']');
	comment.append('<h4>'+user_name+' on '+created_at+'</h4>');
	comment.append('<div class="comment-text"></div>');
	var comment_text = comment.children('.comment-text');
	comment_text.append('<p>'+content+'</p>');

	if (canedit){ 
		comment_text.append(controlsHtml());
	}

}

function newCommentHtml(mid){
	return '<div class="new-comment" mid="'+mid+'">\
		<textarea placeholder="Post a comment" name="content"></textarea>\
		<button class="new">Submit</button>\
	</div>'
}
function messageHtml(mid){
	return '<article class="message" mid='+mid+'></article><div class="comments" mid="'+mid+'">'
}
function commentHtml(cid){
	return '<article class="comment" cid="'+cid+'">'
}
