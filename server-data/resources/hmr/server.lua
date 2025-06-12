-- local AUTHORIZATION_TOKEN = !(TITKOS_MIKKENTYU);
local Routes = {};

SetHttpHandler(function(req, res)
    if (req.method ~= "POST") then
        res.writeHead(405);
        res.send("Method Not Allowed");
        return; 
    end 
    local route = Routes[req.path];
    if (not route) then
        res.writeHead(404);
        res.send("Invalid route");
        return;
    end
    req.setDataHandler(function(data)
        req.body = (data and json.decode(data)) or {};
        route(req, res);
    end);
end);

local invalidResourceStates = { missing = true, uninitialized = true, unknown = true };
local ignoredResources = { [GetCurrentResourceName()] = true };

local function restartResources(resources)
    local failedResources = {};

    ExecuteCommand("refresh");

    for i = #resources, 1, -1 do 
        local resourceName = resources[i];
        if (not resourceName or ignoredResources[resourceName]) then
            table.remove(resources, i);
            goto continue;
        end
        ExecuteCommand("stop " .. resourceName);
        ::continue::
    end

    local failedResources = {};
    for i = 1, #resources do 
        local resourceName = resources[i];
        if (not resourceName) then
            failedResources[resourceName] = "Invalid resource name";
            goto continue;
        end
        if (ignoredResources[resourceName]) then
            failedResources[resourceName] = "You can't restart this resource.";
            goto continue;
        end
        local resourceState = GetResourceState(resourceName);
        if (
            not resourceState or 
            invalidResourceStates[resourceState]
        ) then
            failedResources[resourceName] = "Resource not found";
            goto continue;
        end
        ExecuteCommand("start " .. resourceName);
        for i = 1, 15 do 
            local resourceState = GetResourceState(resourceName);
            if (resourceState == "started") then
                break;
            end
            ExecuteCommand("start " .. resourceName);
            Wait(100);
        end 
        ::continue::
    end 

    return failedResources;
end 
Routes['/stopResources'] = function(req, res)
    local resources = req.body.resources;
    if (type(resources) ~= "table") then
        res.writeHead(400);
        res.send("Invalid request");
        return;
    end

    for i = #resources, 1, -1 do 
        local resourceName = resources[i];
        if (not resourceName or ignoredResources[resourceName]) then
            table.remove(resources, i);
            goto continue;
        end
        ExecuteCommand("stop " .. resourceName);
        ::continue::
    end

    res.writeHead(200);
    res.send("ok");
end
Routes['/restartResources'] = function(req, res)
    local resources = req.body.resources;
    if (type(resources) ~= "table") then
        res.writeHead(400);
        res.send("Invalid request");
        return;
    end

    ExecuteCommand("refresh");
    for i = #resources, 1, -1 do 
        local resourceName = resources[i];
        if (not resourceName or ignoredResources[resourceName]) then
            table.remove(resources, i);
            goto continue;
        end
        ExecuteCommand("stop " .. resourceName);
        ::continue::
    end

    local failedResources = restartResources(resources);
    if (next(failedResources)) then
        res.writeHead(400);
        res.send(json.encode(failedResources));
        return;
    end

    res.writeHead(200);
    res.send("ok");
end 