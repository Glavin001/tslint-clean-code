// module names
namespace WrapperType {
    namespace type {
        // class names
        class type {}
    }
}

namespace SampleType1 {
    // module variables
    var type;
}

namespace SampleType2 {
    // module function
    function type() {}
}

class SampleType3 {
    // class variables
    private type;
}

// class properties
class SampleType4 {
    private var;
    set type(value) {}
    get type() {
        return this.var;
    }
}

class SampleType5 {
    type() {} // class methods
    method(type) {} // method parameters
    private func = type => {}; // arrow function parameters
}

// interface declarations
interface SampleType6 {
    type: any;
}

// function parameters
function methodType(type) {}

// local variables
var type;
