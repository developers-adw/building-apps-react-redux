#!/bin/bash

# @link https://gist.github.com/mattscilipoti/8424018
#
# Called by "git push" after it has checked the remote status,
# but before anything has been pushed.
#
# If this script exits with a non-zero status nothing will be pushed.
#
# Steps to install, from the root directory of your repo...
# 1. Copy the file into your repo at `.git/hooks/pre-push`
# 2. Set executable permissions, run `chmod +x .git/hooks/pre-push`
# 3. Or, use `rake hooks:pre_push` to install
#
# Try a push to master, you should get a message `*** [Policy] Never push code directly to...`
#
# The commands below will not be allowed...
# `git push origin master`
# `git push --force origin master`
# `git push --delete origin master`


protected_branch='main'

policy="\n\n[Policy] Never push code directly to the "$protected_branch" branch! (Prevented with pre-push hook.)\n\n"

current_branch=$(git rev-parse --abbrev-ref HEAD)

do_exit(){
  echo -e $policy
  exit 1
}

if [ $current_branch = $protected_branch ]; then
  do_exit
fi

unset do_exit

exit 0