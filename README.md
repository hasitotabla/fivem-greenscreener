# fivem-greenscreener

A very work-in-progress greenscreener.

## How to use

If you don't have bun installed, you can install it from [here](https://bun.sh/).

```md
git clone https://github.com/hasitotabla/fivem-greenscreener
cd fivem-greenscreener
```

Rename server.cfg.example to server.cfg in server-data/, and change the license to your own

```
bun i
bun run update
bun run build
bun run start
```

After joining the server, you should be able to run these commands **_IN THE SERVER CONSOLE_**

```
/screenshot vehicle/ped/weapon [all / model1,model2,model3,...]
```

There's a few values you could tweak in `server-data/resources/core/config.json`
Also, if you need to greenscreen stuff that's recently came out, update `server-data/resources/core/gamedata.json`. (Scrape together Durty's data dump or idk, have fun.)
