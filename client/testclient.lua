ESX = nil

Citizen.CreateThread(function()
	while ESX == nil do
		TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
		Citizen.Wait(0)
	end 
end)


function DrivingSchoolMenu()

    local items = {
        {label = 'item_car_license', value = 'carLicense'},
        {label = 'item_moto_license', value = 'motorcycleLicense'},
        {label = 'item_truck_license', value = 'truckLicense'}
    }

    ESX.UI.Menu.Open('default',GetCurrentResourceName(),'school_driving_menu', {
        title = 'menu_license_title',
        align = 'left',
        elements = items
        }, function(data,menu)
            local item = data.current.value
            print(item)
            menu.close()
        end, 
        function(data,menu) 
            menu.close()
    end)
end

RegisterCommand("notificacion", function(source , args , rawCommand )
    TriggerEvent('dress:showNotification', 'warning', args, 4000)
end, false)

RegisterCommand("menu", function(source , args , rawCommand )
    DrivingSchoolMenu()
end, false)

RegisterCommand('dialog',function(source, args, rawCommand) 
    ESX.UI.Menu.Open('dialog',GetCurrentResourceName(),'system_test', {
        title = 'Test Dialog'
        }, function(data2,menu2)
            TriggerEvent('dress:showNotification', 'info', data2.value, 4000)
            menu2.close()
        end, 
        function(data2,menu2) 
            menu2.close()
    end)
end,false)