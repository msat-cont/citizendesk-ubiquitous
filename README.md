ubiquitous-cd
=============

Ubiquitous part of Citizen Desk

### install

A MongoDB instance should run on the server where the back-end parts run.
A database named "minicd" should be created there, with "tags" collection.
The "tags" collection should contain an object with feed named 'simple':
```
{'feed':'simple', 'tags': ['tag1', 'tag2', ... , 'tagN']}
```

Run the Python-Flask serveron the mini/back/run.py file. It does the DB-related work.
Run a static pages serving server on the mini/front directory, so that the javascript files are
available under the "/lets/" path.
Create a bookmark on the link presented at the /lets/bookmarks.html page.
Go to any page and 

### requirements

MongoDB is used as the database system for keeping both search tags and chosen text snippets.
Web serving is twofold, basic Python is sufficient for front-end part, the Python framework
Flask is used for the backend, with the help of PyMongo driver.
