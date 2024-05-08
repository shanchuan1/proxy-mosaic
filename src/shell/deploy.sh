#!/bin/bash

# 从环境变量读取路径、压缩文件名、服务器地址和目标路径
LOCAL_PATH="$1"
ZIP_NAME="$2"
REMOTE_USER="$3"
REMOTE_IP="$4"
REMOTE_PATH="$5"

echo Preparing to start deployment

# 本地压缩（使用tar并gzip压缩）
cd "$LOCAL_PATH" && tar -czf "$ZIP_NAME.tar.gz" .

# 传输到远程服务器
scp "$LOCAL_PATH/$ZIP_NAME.tar.gz" "$REMOTE_USER@$REMOTE_IP:$REMOTE_PATH"

# 更新远程解压逻辑以匹配tar.gz
# ssh "$REMOTE_USER@$REMOTE_IP" "cd $REMOTE_PATH && tar -xzf \"$ZIP_NAME.tar.gz\" && rm \"$ZIP_NAME.tar.gz\""

# 暂时不删除远程压缩包
ssh "$REMOTE_USER@$REMOTE_IP" "cd $REMOTE_PATH && tar -xzf \"$ZIP_NAME.tar.gz\"" 