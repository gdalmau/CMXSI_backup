# CMXSI_backup

Petita aplicació per gestionar còpies de BD en servidors. 

Projecte creat per l'assignatura Configuració i Manteniment de Xarxes i Serveis d'Internet.

Pràctica 2

Creat per: Oriol Testart & Gerard Dalmau

# Configuració:

Al fitxer config.json caldrà especificar el directori el qual volem inicialitzar els repositoris així com
les dades de MySQL per realitzar les còpies incrementals.

Aquestes còpies es guardaran a la carpeta backups de la root del projecte.

# Possibles Millores

Podriem gestionar millor les importacions de javascript dins del projecte utilitzant "module bundlers" com webpack
per tal de realitzar menys consultes al servidor.

Afegir diversos servidors en els quals realitzar les còpies igualent com a protecció contra atacs de ransomware.

Afegir autenticació per accedir a l'aplicatiu.

Instal·lar paquet git per gestionar també fitxers binaris de manera eficient
