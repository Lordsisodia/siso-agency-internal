#!/bin/bash

echo "📊 ROOT DIRECTORY ANALYSIS"
echo "=========================="
echo ""

echo "Markdown Documentation Files:"
echo "-----------------------------"
ls -1 *.md 2>/dev/null | wc -l | xargs echo "Total .md files:"
ls -1 *.md 2>/dev/null | head -20

echo ""
echo "Python Scripts:"
echo "---------------"
ls -1 *.py 2>/dev/null | wc -l | xargs echo "Total .py files:"
ls -1 *.py 2>/dev/null

echo ""
echo "Shell Scripts:"
echo "--------------"
ls -1 *.sh 2>/dev/null | wc -l | xargs echo "Total .sh files:"
ls -1 *.sh 2>/dev/null

echo ""
echo "HTML Files:"
echo "-----------"
ls -1 *.html 2>/dev/null | wc -l | xargs echo "Total .html files:"
ls -1 *.html 2>/dev/null

echo ""
echo "Config Directories in Root:"
echo "---------------------------"
ls -d .* 2>/dev/null | grep -v "^\.$\|^\.\.$\|^\.git$" | head -20

