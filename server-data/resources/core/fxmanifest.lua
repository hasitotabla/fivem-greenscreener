fx_version "cerulean"
game "gta5"

node_version '22'

server_script 'server/dist/index.js'
client_script 'client/dist/index.js'

ui_page "http://localhost:5173"
files {
    "webview/dist/**/*"
}