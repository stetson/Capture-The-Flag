# Modules

## Building

To build the latest version of all modules, simply enter the following command while in the /modules/ directory:

	node-waf configure build

## Creating New Modules

When creating new modules, please follow the guildlines provided in the Node.js documentation.
[Node.js Addons](http://nodejs.org/docs/v0.4.3/api/addons.html)
[Writing Node.js Native Extensions](https://www.cloudkick.com/blog/2010/aug/23/writing-nodejs-native-extensions/)

Any additional classes to your module must be added to the wscript file in the /modules/ directory as such:
	obj = bld.new_task_gen("cxx", "shlib", "node_addon")
	obj.cxxflags = ["-g", "-D_FILE_OFFSET_BITS=64", "-D_LARGEFILE_SOURCE", "-Wall"]
	obj.target = "Logic"
	obj.source = "Logic.cc Algorithms.cc"

Where "Logic" is the name of the module, "Logic.cc" is the primary class and "Algorithms.cc" is a class outside of the module. All classes used by the module MUST be included in the source line or segmentation faults (and other fun errors) will occur.

For more information about WAF Scripts, check out this really long refrence website: [The Waf Book](http://waf.googlecode.com/svn/docs/wafbook/single.html)

