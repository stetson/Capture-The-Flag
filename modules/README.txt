Just a simple explaination of how things work in here. 
They are rather crude, but its easier than jumping in blind.

1. Write modules in C++. Check out the following websites for some documentation on how to do so.
	http://nodejs.org/docs/v0.4.1/api/addons.html
	https://www.cloudkick.com/blog/2010/aug/23/writing-nodejs-native-extensions/

2. Write a simple node server to test or use modules (see above URLs for help with this).

3. Add the module to the WAF script by editing "wscript" in the module directory. Formatting should be obvious, use the other modules as an example.

4. Build the modules by running the following command:
	node-waf configure build

5. If there aren't any build errors, run the test server you made in step 2:
	node {test-server-file}
