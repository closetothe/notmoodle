# NOT Moodle

www.notmoodle.com is a simple forum for the students of MECH 215 (C++ for Mechanical Engineers) at Concordia University. The backend runs on an Ubuntu virtual machine with NodeJS, Express, and MongoDB.

I created it for two reasons:

1. To communicate with the students. As a TA, I don't have access to the course website (usually Moodle).
2. When I took IFT 2035 at L'Université de Montréal, I noticed that the students (including myself) found great use in an active discussion forum, especially for a programming course. At Concordia, no such forum exists, or at least none that is voluntarily used by anybody.

**The point of this site is to reduce the inertia required to 'get involved'**. There is no login, and it can be completely anonymous if the poster so chooses. On a small scale this works great, and students are way more likely to ask questions they would otherwise be (unrightfully) embarrassed to ask.

During my time as a TA, it did its job. Anyone is welcome to use this for their own purposes, hence why I made it open-source.

## Update (Summer 2019)
I now use the site to manage other open-source projects I'm working on. For example, [detdb](http://github.com/closetothe/detdb). The site essentially works like this:

* MECH215-specific routes. This keeps track of the year and semester, and easily be generalized to any course. For example, `/mech215/2019/winter` is handled by these routes (see `routes/mech215.js`). **I can implement a generalized-course version by request.**
* Generic forum routes. Any forum could be created under a `topic`. The route to this forum is the topic name. For example, `/detdb`. These forums have no year or semester, and can easily be added by appending their name to the `topics` list and creating a slightly different nav bar and index.
* Nobody logs in except for an admin. Otherwise, there is too much inertia. Admins are created manually, and I am the only admin for the live site. Admins can edit and delete posts, and also mark posts as 'admin' posts.

I also switched the site from a DigitalOcean VM to Heroku.