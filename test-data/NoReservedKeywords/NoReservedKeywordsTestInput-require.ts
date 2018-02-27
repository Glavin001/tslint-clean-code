// module names
namespace WrapperRequire {
    namespace require {
        // class names
        class require {}
    }
}

namespace SampleRequire1 {
    // module variables
    var require;
}

namespace SampleRequire2 {
    // module function
    function require() {}
}

class SampleRequire3 {
    // class variables
    private require;
}

// class properties
class SampleRequire4 {
    private var;
    set require(value) {}
    get require() {
        return this.var;
    }
}

class SampleRequire5 {
    require() {} // class methods
    method(require) {} // method parameters
    private func = require => {}; // arrow function parameters
}

// interface declarations
interface SampleRequire6 {
    require: any;
}

// function parameters
function methodRequire(require) {}
