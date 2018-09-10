$("img").each(function(i) {
    $(this).attr("class", Math.pow((-1), i) == -1? "imgLeft" : "imgRight");
});