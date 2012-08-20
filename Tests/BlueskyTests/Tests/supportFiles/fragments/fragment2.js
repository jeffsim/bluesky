/* External script test */
$(document).ready(function () {
    // this should run before .cache() returns
    window.fragmentTestValue5 = 500;

    // this should run before .cache() returns, but not have an impact.  Same with render.
    $("#test2").text("Baz");
});

window.fragmentTestFunc2 = function () {
    // Both of these are explicitly called after cache/render returns, and so work
    $("#test2").text("qwer");
    window.fragmentTestValue = 100;
};
// this should run before .cache() returns
window.fragmentTestValue4 = 400;

// This should run only on the first cache/render instance, not on subsequent ones.
if (!window.fragmentTestValueA)
    window.fragmentTestValueA = 1;
else
    window.fragmentTestValueA++;
