# Git client

This module uses a Git repository's working tree as the source folder for a blog on Blot.

Dependencies 
------------

Move these into this module when I start using git submodules or npm submodules properly.

    "http-auth": "^3.2.3",
    "pushover": "^1.3.6",
    "simple-git": "^1.92.0",
    "uuid": "^3.2.1"

Pitfalls
--------
* are all of simple-git's error strings turned into error objects? ran into issues with tests and this
* is authentication failing? are the pushes getting through?
* are you passing arguments to simple-git correctly? silently ignoring flags tripped me up.
* is a simple-git command propagating up to blot's git repo? this might cause strange behaviour.
* is simple-git's PullSummary not containing the files it should?
* I ran into a race condition when some tests were failing on my test server, but not locally. Basically, my tests were checking to see if a sync had finished, before the sync had even started. 

How does it work?
-----------------

This is the structure of the repositories involved in updating the user's blog:

               Repository 1.
        bare repo in data folder
                    |
         -–––––––––––––––––––––––-
         |                       |
   Repository 2.           Repository 3. 
 Checked out repo       Checked out repo in 
on user's computer      blog's source folder
                           on Blot server

The user works in repository 2. This is where they'll add new blog posts and update existing ones. When a user creates a draft post, Blot will write the preview file to Repo 3, then attempt to push to 'Master', i.e. Repo 1. The user then pulls from repo 1 to retrieve the preview file. 

Recent research indicate it's possible to dynamically retrieve files from a bare repo using low-level git commands. So perhaps the additional Repo is not needed and will naturally incur a performance cost. 


Set up
------

1. Create a bare repository. A bare repository is basically just the contents of the .git folder. It doesn't have a 'working tree', that is, it doesn't contain the 'files' in the repository. This means, for reasons I don't quite understand, you can have multiple collaborators push and pull to it more easily.

2. Copy any existing files in the blog's folder into a temporary directory, then clone the bare repository to the blog's source folder on Blot's server. This is neccessary because you can't clone a repository into an existing non-empty folder. Copy the files from the temp folder