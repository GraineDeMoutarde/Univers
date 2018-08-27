var gulp = require('gulp');
var gutil = require('gulp-util');
var tap = require('gulp-tap');
var MarkdownIt = require('markdown-it');
var container = require('markdown-it-container');

var md = new MarkdownIt();
md.use(container, 'container');
md.use(require('markdown-it-sup'));
md.use(require('markdown-it-sub'));
md.use(require('markdown-it-footnote'));
md.use(container, 'title', {
    render: function(tokens, idx) {
        var content = tokens[idx].info.trim().split(" ");
        // console.log(content);
        // return "";
        if (tokens[idx].nesting === 1) {
            var href="node_modules/bootstrap/dist/css/bootstrap.min.css";
            //get the correct href --- content[2] is the folder depth
            href = "../".repeat(content[2]) + href
            return "<!DOCTYPE html>\n        <html lang=\"fr\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n            <link rel=\"stylesheet\" href=\"" + href + "\" type=\"text/css\">\n            <title>" + content[1].trim() + "</title>\n";
            
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
    result = result.replace(".md", ".html");
    file.contents = new Buffer(result);
    file.path = gutil.replaceExtension(file.path, '.html');
    return;
}

gulp.task('watch', function() {
    gulp.watch('**/*.md', ['build']);
});
