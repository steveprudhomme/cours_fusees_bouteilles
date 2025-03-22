# Cours sur les fusées à eau – Scenari Opale

Ce projet propose un **module pédagogique complet** réalisé avec la chaîne éditoriale **Scenari Opale**, destiné à initier les élèves aux **fusées à eau**, à leur construction, aux principes physiques sous-jacents et aux mesures de sécurité.

## 📚 Contenu du cours

Le module aborde les thématiques suivantes :

- **Introduction aux fusées à eau**
- **Construction d'une fusée à eau** (étapes, matériaux)
- **Sécurité lors des lancements**
- **Principes physiques** (forces, poussée, lois du mouvement, etc.)

## 🗂 Structure du projet

Ce dépôt contient :

- `*.xml` : fichiers structurés de contenu Opale
- `*.mtex` : formules mathématiques en LaTeX
- `img/` : illustrations pédagogiques
- `~gens/` : publications générées (site web, PDF, diaporama)

## 🛠 Installation de Scenari Opale

### Prérequis

- **Système d’exploitation** : Windows, macOS ou Linux
- **Java** : Java 8 ou plus récent (OpenJDK recommandé)
- **TeX Live** : pour le rendu des équations LaTeX dans les fichiers `.mtex`
- **OpenOffice** (ou LibreOffice) : pour générer les documents de type `.odt` (ex. : publication imprimable)

💡 **Installation rapide des dépendances :**  
- **TeX Live** (Linux) :  
  Debian/Ubuntu : `sudo apt install texlive-full`  
  Arch : `sudo pacman -S texlive-most`  
- **TeX Live** (macOS) : via MacTeX https://tug.org/mactex/  
- **TeX Live** (Windows) : via https://tug.org/texlive/windows.html  
- **OpenOffice** : https://www.openoffice.org/fr/Telecharger/  
- **LibreOffice** (alternative) : https://fr.libreoffice.org

### Étapes d'installation

1. 📥 Rendez-vous sur le site officiel : https://scenari.org/co/Opale
2. Téléchargez la **chaîne éditoriale Opale** adaptée à votre système :
   - *Opale Desktop* pour une utilisation locale
   - *MyScenari* si vous préférez une solution autonome
3. Installez :
   - Scenari Opale
   - TeX Live (pour les équations)
   - OpenOffice (pour les exports OpenDocument)
4. Lancez l'application et créez un nouvel **atelier Opale**
5. Importez les fichiers du présent dépôt dans l’atelier

## 🚀 Génération et consultation du cours

Une fois l’atelier créé et les fichiers importés dans Opale :

1. Cliquez sur le module principal pour l’ouvrir
2. Sélectionnez l’option **"Publier"** pour générer une sortie :
   - 🌐 [Site web HTML](https://github.com/steveprudhomme/cours_fusees_bouteilles/tree/main/~gens/fusees_bouteilles/module.publi/fr-FR/web)
   - 🎞 [Diaporama](https://github.com/steveprudhomme/cours_fusees_bouteilles/tree/main/~gens/fusees_bouteilles/module.publi/fr-FR/diaporama)
   - 📄 [PDF (nécessite TeX Live)](https://github.com/steveprudhomme/cours_fusees_bouteilles/blob/main/~gens/fusees_bouteilles/module.publi/fr-FR/pdf/module.pdf)
   - 📝 [Document OpenOffice/LibreOffice (.odt)](https://github.com/steveprudhomme/cours_fusees_bouteilles/blob/main/~gens/fusees_bouteilles/module.publi/fr-FR/od/module.odt)

3. Consultez les fichiers générés dans le dossier `~gens/`.

## 🧾 Licence

Ce projet est distribué sous la **licence GPL-3.0**. Consultez le fichier `LICENSE` pour plus de détails.

## 🔗 Ressources utiles

- [Documentation Opale](https://doc.scenari.software/Opale)
- [Forums communautaires Scenari](https://forums.scenari.org/c/modeles-documentaires/opale/7)
- [TeX Live](https://tug.org/texlive/)
- [Apache OpenOffice](https://www.openoffice.org/)
- [LibreOffice](https://www.libreoffice.org/)
- [Autres modèles Scenari](https://scenari.org/co/)

## 🤝 Contribuer

Les contributions sont les bienvenues ! Ouvrez une *issue* ou proposez une *pull request* pour améliorer le contenu ou l’organisation du module.
