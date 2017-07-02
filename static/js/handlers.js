

$('.new-message input[type="submit"]').mouseenter(function(){
	$(this).css('text-decoration', 'underline');
})
$('.new-message input[type="submit"]').mouseleave(function(){
	$(this).css('text-decoration', 'none');
})
$(document).on('mouseenter', '.msg-text, .comment', function(){
	$(this).find('.fa').fadeTo(10,1);
})
$(document).on('mouseleave', '.msg-text, .comment', function(){
	$(this).find('.fa').fadeTo(10,0)
})

function getButtonData(button){
	container = button.parent().parent(); 
	//container will be either msg-text or comment-text
	article = container.parent();
	if(container.hasClass('msg-text')){
		texttype='message';
		mid = article.attr('mid');
		id = mid;
	}else if(container.hasClass('comment-text')){
		texttype='comment';
		id = article.attr('cid');
		mid = article.parent().parent().attr('mid');
	}
	data = {
		texttype: texttype,
		mid: mid,
		id: id,
		container: container,
		article: article
	};
	return data;
}
function resizeAds(){
	contentHeight = $('section').css('height');
	$('#ads').css('height', contentHeight);
};


$(document).on('click', '.msg-text a', function(){
	var article = $(this).parent().parent();
	// console.log('a tag clicked');
	var mid = article.attr('mid');
	var comments = $('.comments[mid='+mid+']');

	n = $(this).attr('n');
	if(comments.css('display')=='none'){
		comments.slideDown(300, function(){
			if (n=='0'){
				comments.find('textarea').focus();
			};
			resizeAds();
		});

		$(this).html('&and; Hide Comments');
	}else{
		comments.slideUp(300, function(){resizeAds();});
		$(this).html('&rsaquo; '+n+' Comments');
	}


	return false; // dont reload the page
})

$(document).on('mouseenter', '.fa', function(){
	var color;
	if($(this).hasClass(editIcon)){
		color = 'green';
	}else if($(this).hasClass(deleteIcon)){
		color = 'red';
	}else if($(this).hasClass(cancelIcon)){
		color = 'gray';
	}else if($(this).hasClass(saveIcon)){
		color = 'green';
	}
	$(this).css('color', color);
})

$(document).on('mouseleave', '.fa', function(){
	$(this).css('color', 'black')
})


$(document).on('click', '.'+editIcon, function(){
	// change to the save icon
	//console.log($(this));

	$(this).removeClass(editIcon);
	$(this).addClass(saveIcon);
	
	$('.bottom').removeClass(deleteIcon);
	$('.bottom').addClass(cancelIcon);

	var container = $(this).parent().parent();
	var article = container.parent();

	//article.css('outline', '1px green solid');
	var p = container.children('p')
	var content = p.text();
	
	var orig_height = container.css('height');
	var ta_height = (parseInt(orig_height) - 1) +'px';

	// remove original text and replace with textarea
	p.html('<textarea class="edit" style="height: '+ta_height+'"></textarea>')
	p.children('textarea').text(content).focus();
	
	resizeAds();
})


$(document).on('click', '.'+saveIcon, function(){
	var data = getButtonData($(this));

	var container = data.container;
	var article = data.article;
	var texttype = data.texttype;
	var id = data.id;

	var p = container.children('p');
	var content = p.text();

	var textarea = container.find('textarea');
	var new_text = textarea.val();

	$.post('/update/'+texttype,
		{	
			id: id,
			content: new_text
		},
		function(res){
			console.log(res)
			resizeAds();
		}
	)
	
	// replace text area with p 
	p.html(new_text);

	$(this).removeClass(saveIcon);
	$(this).addClass(editIcon);
	$('.bottom').removeClass(cancelIcon);
	$('.bottom').addClass(deleteIcon);
	resizeAds();
})

$(document).on('click', '.'+deleteIcon, function(){
	var data = getButtonData($(this));

	var container = data.container;
	var article = data.article;
	var texttype = data.texttype;
	var id = data.id;
	var mid = data.mid;

	//header = article.children('h4').text();
	var p = container.children('p');
	var contents = p.text();
	var preview_length = 15;
	if(contents.length > preview_length){
		dots = '...';
	}else{
		dots = '';
	}
	var preview = contents.slice(0,preview_length);

	var okToDelete = confirm('Are you sure you want to delete this '+texttype+': "'+preview+dots+'"?');
	if(okToDelete){
		$.post('/delete/'+texttype,
			{
				id: id,
				mid: mid
			},
			function(res){
				console.log(res);
				article.slideUp(200).remove();
				resizeAds();
			}
		)
	}else{
		return
	}
})

$(document).on('click', '.new', function(){
	var container = $(this).parent();
	var texttype, mid, ncomments;

	console.log('container', container);
	
	if(container.hasClass('new-message')){
		texttype = 'message';
		mid = null;
		ncomments = 0;
	}else if(container.hasClass('new-comment')){
		texttype = 'comment';
		mid = container.attr('mid');
		ncomments = parseInt(container.find('a').attr('n')) + 1;
	}

	var content = container.children('textarea').val();

	$.post('/add/'+texttype,
		{
			content: content,
			mid: mid
		},
		function(res){
			console.log(res);
			var newid = res.id;
			var user_name = res.user_name;
			var created_at = res.created_at;

			// append/prepend the new message or comment
			if(texttype == 'message'){
				var msghtml = messageHtml(newid);
				if(msgSort=='earliestFirst'){
					$('#messages').append(msghtml);
				}else{
					$('#messages').prepend(msghtml);
				}
				populateMessage(newid, user_name, created_at, ncomments, content)
				$('.comments[mid='+newid+']').append(newCommentHtml(mid));


			}else if(texttype=='comment'){
				var commenthtml = commentHtml(newid);
				var parent = $('.comments[mid='+mid+']');
				var a = $('.message[mid='+mid+']').find('a');
				a.attr('n',  parseInt(a.attr('n')) + 1);
				if(a.text!="Hide Comments"){
					a.text = ncommText(a.attr('n'));
				}
				if(commentSort=='earliestFirst'){
					parent.children('.new-comment').remove(); // remove the new comment box
					parent.append(commenthtml);
					parent.append(newCommentHtml(mid));
				}else{
					parent.prepend(commenthtml);
				}
				populateComment(newid, user_name, created_at, content);
			}
		
			resizeAds();	
		}
	)
})