# PUTTER

Putter runs simplified Collections of "unit tests" against web application.

A simple program that reads in a Postman Collection JSON file, does some
very basic pre-request processing, executes HTTP requests, and then runs some
also pretty basic javascript tests against the response.

Kind of like unit tests, except vs. a web server, and also very bare-bones.
There are a lot of features included in postman and available in the postman
collection json. This program doesn't do much beyond what was necessary at the time.

## Installation

Clone the repository into a suitable local directory. (This hasn't been published
to NPM yet.) Then install dependencies via npm:

```sh
npm install
```

## Quick Example

1. Start up your CS 261 project 
 
     `node assignment2`
2. Run the tests with the appropriate postman input file

    `node putter run path/to/CS261_Assignment2_Postman.json`

3. Were there problems? Run in --verbose mode to get a bunch of output:

    `node putter run --verbose path/to/CS261_Assignment2_Postman.json`

## History

For a course that I'm teaching, the assignments are graded in part by testing
them vs. a unit testing suite - you implement enough of the web service to get
the unit tests to pass, and then you know you've (mostly) finished the project.

These unit tests were originally written using Postman, as a Collection, using
a tiny fraction  of the power and ability of this tool. In particular, we didn't
need any of  the "Enterprisey" stuff. Just a way to run a bunch of tests,
evaluate the  responses from a web server, and "pass / fail" them. No big deal.

Unfortunately, the free version of Postman limits how many times you can
execute a collection... this means that we can't use the free version in the class.

So ... since we're basically just making HTTP requests against a localhost server,
and the tests themselves are written in javascript, and all we really need is
pretty simple, without a lot of UI and flash and, honestly, very cool features...

This was written for use by the CS 261 Computer Networks II course. If you're not
in that course, I'm not sure how much use this code is to you.
