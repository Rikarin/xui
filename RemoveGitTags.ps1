# This script will remove all tags on remote that are not present locally

$remoteTags = git ls-remote --tags origin | ForEach-Object {
    ($_ -split "`t")[1] -replace '^refs/tags/', '' -replace '\^\{\}$', ''
} | Sort-Object -Unique

# Get list of local tags
$localTags = git tag | Sort-Object

# Find remote-only tags
$tagsToDelete = Compare-Object -ReferenceObject $remoteTags -DifferenceObject $localTags -PassThru | Where-Object {
    $_ -in $remoteTags
}

foreach ($tag in $tagsToDelete) {
    Write-Host "Deleting remote tag: $tag"
# Uncomment to execute
#    git push origin ":refs/tags/$tag"
}
