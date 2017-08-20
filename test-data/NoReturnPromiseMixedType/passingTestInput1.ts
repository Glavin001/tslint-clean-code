// class Promise<T> {}

function doStuff2(input) {
    if (input === "doIt") {
        return new Promise<boolean>();
    }
    return new Promise<boolean>();
}

// const nonAsyncPromiseFunctionExpressionA = function(p: Promise<void>) { return p; };

// const nonAsyncPromiseFunctionExpressionB = function() { return new Promise<void>((resolve, reject) => resolve()); };

// function nonAsyncPromiseFunctionExpressionC(p: Promise<void>) { return p; };