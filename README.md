# Student Forum app

Contains functionality to write posts ('messages'), and comment on your message or other's messages. The below screenshot shows two users Anna, who is currently logged in, and Ana, who is a troll. 

Hovering the mouse over a message or comment will display the edit controls (a pencil for editing the message and a trash can to delete it). You can only edit / delete messages you have written. 

The application uses jQuery to directly update the page after a new/edit/ or deletion is made, while it sends a post request to the database in the background. This allows the user to continue using the site without the page refreshing. 

### Homepage
![wall](/doc/wall.png)

### Editing a message

When you edit a message or comment, the pencil and trashcan icons turn into a save icon and an X icon. Save sends your changes to the database, and X cancels any changes. 

If you press the delete button on a message or comment, you will receive an alert asking to confirm if you really want to delete it. Note, when you delete a message you also delete any comments that belong to it, since there is a foreign key relationship between the messages and comments tables. 

![edit-msg](/doc/edit-msg.png)


### Todo 
* allow user to change the sort order (earliest to latest, or latest to earliest)