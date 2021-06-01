@ECHO OFF
ECHO ==========================
ECHO Starting Lavalink
ECHO ==========================
start cmd /k java -jar ./Lavalink.jar
ECHO ==========================
@ECHO Taking a 7 Second Break for Lavalink
ECHO ==========================
timeout /T 7 /nobreak
ECHO ==========================
@ECHO Starting BOT
ECHO ==========================
start cmd /k node .
exit /s
