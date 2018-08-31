var gulp = require('gulp');
var gutil = require('gulp-util');
var tap = require('gulp-tap');
var MarkdownIt = require('markdown-it');
var container = require('markdown-it-container');

var md = new MarkdownIt({
    html: true,
    linkify: false,
    typographer: true
  });
md.use(container, 'container');
md.use(require('markdown-it-sup'));
md.use(require('markdown-it-sub'));
md.use(require('markdown-it-footnote'));
md.use(require('markdown-it-headinganchor'));
md.use(require('markdown-it-imsize'), {autofill: true});
md.use(container, 'title', {
    render: function(tokens, idx) {
        var content = tokens[idx].info.trim().split(" ");
        // console.log(content);
        // return "";
        if (tokens[idx].nesting === 1) {
            //get the correct href --- content[2] is the folder depth
            // console.log(content[content.length-1]);
            folder_up = "../".repeat(parseInt((content[content.length-1])));
            return "<!DOCTYPE html>\n        <html lang=\"fr\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n"+
            "<link rel=\"stylesheet\" href=\"" +
            folder_up + "node_modules/bootstrap/dist/css/bootstrap.min.css\" type=\"text/css\">\n"+       
            // "<link rel=\"stylesheet\" href=\"" + folder_up +"ressources/style.css\">"+            
            "<title>" + content.slice(1, -1).join(" ") + "</title>\n";
            
        } else {
            return "        </head>\n"
        }
    }
})

gulp.task('build-encyclopedia', function() {
    return gulp.src('Encyclopédie/**/*.md')
        .pipe(tap(markdownToHtml))
        .pipe(gulp.dest('./website'));
});

function markdownToHtml(file) {
    var result = md.render(file.contents.toString());
    // changes every md link into html link
    result = result.replace(/\.md/g, ".html");
    result = result.replace("class=container", "class=container text-justify");
    file.contents = new Buffer(result);
    file.path = gutil.replaceExtension(file.path, '.html');
    return;
}

gulp.task('watch', function() {
    gulp.watch('**/*.md', ['build-encyclopedia']);
});

gulp.task('toc', function() {
    return gulp.src('Encyclopédie/**/*.md')
      .pipe(toc({index: 'main.md'}))
      .pipe(gulp.dest('./Encyclopédie'));
  });