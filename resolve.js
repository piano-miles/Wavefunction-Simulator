// This script is purely for deleting the start message and page blur elements.
resolve = e => e.checked || (
    document.getElementById("start").remove(),
    document.getElementById("blurry").remove()
);