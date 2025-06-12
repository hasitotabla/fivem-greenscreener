function requestAsset(hash, p1, p2)
    RequestWeaponAsset(hash, p1, p2);
    while not HasWeaponAssetLoaded(hash) do
        Wait(0);
    end

    return hash;
end 

-- Basic weapon spawning as object
function SpawnWeaponAsObject(weaponHash, x, y, z, ammo)
    -- Get weapon hash if string is provided
    if type(weaponHash) == "string" then
        weaponHash = GetHashKey(weaponHash)
    end
    
    -- Default ammo amount
    ammo = ammo or 30
    
    -- Request the weapon asset
    weaponHash = requestAsset(weaponHash, true, false)
    if weaponHash == 0 then
        print("Failed to load weapon asset: " .. tostring(weaponHash))
        return nil
    end

    -- Create the weapon object
    local weaponObject = CreateWeaponObject(weaponHash, ammo, x, y, z, true, 1.0, 0)
    
    -- Set object as a mission entity (prevents despawning)
    FreezeEntityPosition(weaponObject, true)
    SetEntityAsMissionEntity(weaponObject, true, true)
    
    return weaponObject
end

-- Example usage - spawn weapon at player position
RegisterCommand("spawngun", function(source, args)
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    
    -- Spawn AK-47 in front of player
    local weaponHash = "weapon_assaultrifle"
    local x, y, z = coords.x + 2.0, coords.y, coords.z
    
    local weaponObj = SpawnWeaponAsObject(weaponHash, x, y, z, 50)
    
    if weaponObj then
        print("Weapon spawned successfully!")
        -- Optional: Add blip to weapon
        local blip = AddBlipForEntity(weaponObj)
        SetBlipSprite(blip, 110)
        SetBlipColour(blip, 1)
    end
end)

-- Advanced spawning with rotation and physics
function SpawnWeaponAdvanced(weaponHash, coords, rotation, ammo, networked)
    if type(weaponHash) == "string" then
        weaponHash = GetHashKey(weaponHash)
    end
    
    ammo = ammo or 30
    networked = networked or true
    
    -- Request the weapon asset
    weaponHash = requestAsset(weaponHash, true, false)
    if weaponHash == 0 then
        print("Failed to load weapon asset: " .. tostring(weaponHash))
        return nil
    end

    -- Create weapon object
    local weaponObject = CreateWeaponObject(weaponHash, ammo, coords.x, coords.y, coords.z, networked, 1.0, 0)
    
    if weaponObject and weaponObject ~= 0 then
        -- Set rotation if provided
        if rotation then
            SetEntityRotation(weaponObject, rotation.x, rotation.y, rotation.z, 2, true)
        end
        
        -- Set as mission entity
        SetEntityAsMissionEntity(weaponObject, true, true)
        
        -- Enable physics
        SetEntityDynamic(weaponObject, true)
        ActivatePhysics(weaponObject)
        
        return weaponObject
    end
    
    return nil
end

-- Spawn weapon with custom properties
RegisterCommand("spawnweapon", function(source, args)
    if #args < 1 then
        print("Usage: /spawnweapon <weapon_name> [ammo]")
        return
    end
    
    local weaponName = args[1]
    local ammo = tonumber(args[2]) or 30
    
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    local forward = GetEntityForwardVector(playerPed)
    
    -- Position weapon 2 units in front of player
    local spawnCoords = {
        x = coords.x + forward.x * 2.0,
        y = coords.y + forward.y * 2.0,
        z = coords.z
    }
    
    local weaponObj = SpawnWeaponAdvanced(weaponName, spawnCoords, nil, ammo, true)
    
    if weaponObj then
        print(string.format("Spawned %s with %d ammo", weaponName, ammo))
    else
        print("Failed to spawn weapon")
    end
end)

-- Common weapon hashes for reference
local weaponHashes = {
    pistol = "weapon_pistol",
    ak47 = "weapon_assaultrifle",
    m4 = "weapon_carbinerifle",
    sniper = "weapon_sniperrifle",
    shotgun = "weapon_pumpshotgun",
    smg = "weapon_smg",
    rpg = "weapon_rpg",
    knife = "weapon_knife",
    bat = "weapon_bat"
}

-- Utility function to clean up weapon objects
function CleanupWeaponObjects(radius)
    local playerPed = PlayerPedId()
    local coords = GetEntityCoords(playerPed)
    radius = radius or 10.0
    
    local objects = GetGamePool('CObject')
    local cleaned = 0
    
    for i = 1, #objects do
        local obj = objects[i]
        if IsEntityAWeapon(obj) then
            local objCoords = GetEntityCoords(obj)
            local distance = #(coords - objCoords)
            
            if distance <= radius then
                DeleteEntity(obj)
                cleaned = cleaned + 1
            end
        end
    end
    
    print(string.format("Cleaned up %d weapon objects", cleaned))
end

RegisterCommand("cleanweapons", function()
    CleanupWeaponObjects(20.0)
end)