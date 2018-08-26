var gulp = require('gulp');
var gutil = require('gulp-util');
var tap = require('gulp-tap');
var MarkdownIt = require('markdown-it');
var container = require('markdown-it-container');

var md = new MarkdownIt();
md.use(container, 'container');
md.use(container, 'title', {
    render: function(tokens, idx) {
        var content = tokens[idx].info.trim().match("^title(.*)$");
        if (tokens[idx].nesting === 1) {
            return "<!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">\n            <link rel=\"stylesheet\" href=\"./node_modules/bootstrap/dist/css/bootstrap.min.css\">\n            <title>" + content[1].trim() + "</title>\n";
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
    file.contents = new Buffer(result);
    file.path = gutil.replaceExtension(file.path, '.html');
    return;
}

gulp.task('watch', function() {
    gulp.watch('**/*.md', ['build']);
});
