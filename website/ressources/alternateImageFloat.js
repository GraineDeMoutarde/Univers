$("img").each(function(i) {
    $(this).attr("style", Math.pow((-1), i) == -1? "float: left" : "float: right");
});