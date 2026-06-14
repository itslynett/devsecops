#!/bin/bash

# 1. Format the NameNode ONLY if the metadata directory is empty
if [ ! -d "/opt/hadoop/data/nameNode/current" ]; then
    echo "Formatting NameNode for the first time..."
    hdfs namenode -format -force -nonInteractive
else
    echo "NameNode already formatted, skipping..."
fi

# 2. Start the NameNode
hdfs namenode