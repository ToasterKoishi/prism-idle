 cat replacements.txt | xargs -n 2 bash -c 'git grep -l $0 | xargs sed -i "s/$0/$1/g"'