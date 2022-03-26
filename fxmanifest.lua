fx_version 'adamant'

game 'gta5'

description 'Integrate interface ESX'

version '1.0.0'

ui_page ('data/interface.html')

server_scripts {
	'@es_extended/locale.lua',
}

client_scripts {
	'@es_extended/locale.lua',
	'client/*.lua',
}

files {
	'data/**/*',        
}
