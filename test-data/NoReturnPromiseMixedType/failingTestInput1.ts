class Promise<T> {}

function doStuff1(input) {
    if (input === "stuff") {
        return new Promise<boolean>();
    }
    if (input === "other") {
        return true;
    }
    return false;
}