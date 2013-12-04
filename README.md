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
Run a static pages serving server on the mini/front directory, so that the javascript files
are available under the "/lets/" path.

Go to the the http://localhost:8000/lets/bookmarks.html page,
and fill in a local user name that will be used for the bookmarklet.
Create a bookmark on the link presented at that page then.

### usage

Go to any page and click on the bookmarklet saved in your bookmarks.

* 'find terms' searches for the pre-defined terms in the current page.
* 'send selection' puts any mouse-selected text into database, along with the user name.
* 'commit data' opens a page where the already saved text snippets are listed.

### requirements

MongoDB is used as the database system for keeping both search tags and chosen text snippets.
Web serving is twofold, basic Python is sufficient for front-end part, the Python framework
Flask is used for the backend, with the help of PyMongo driver.

