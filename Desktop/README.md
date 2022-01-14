# VTEX Mobile - Dev Implementation Guide
#### **Version:** 1.1
#### **Author:** lconde@brandlive.net

## IMPORTANT
- Don't leave any reference to the base template, this impacts the site SEO and the face value against the client.
- Don't leave unused code, it elevates the payload, is a bad practice and affects developer handouts.


## Getting Started
- Create a `mobile` folder inside the root [SRC] of the proyect.
- Copy [Don´t Clone] all the `VTEX Mobile` files to the current created folder.
- Modify `package.json` to change the accountName to the current proyect and proceed to install the Dependencies.
- Ask for the corresponding certificates to be generated.
- Ask for the MiddleWare fix to apply on multisite environments.
- Ensure that your Site folder structures abides with this Doc:

  https://help.vtex.com/tutorial/cms-folder-structure

## Copying the Base Template
**A) Copy the following elements as provided from the Base:**
- HTML Templates
- Sub Templates
- Shelves templates

**B) Copy Layouts & Folder Structure from the Parent Site**

**C) Assign Mobile Templates to their corresponding Layouts**

**D) Copy Placeholders & Settings from the Base Templates**

**E) Upload all CSS, JS & Images**

## Tailoring the templates
- Assign Shelf ID from the `Shelf Template` to the `Mobile Grid Template`.

- Change Width & Height of the `GetImageTag` control form the `Shelf Template`. You can get the reference from the Parent Site Grid.

- Change the `Mobile Head` template to add the relevant info. Use this site as a tool for favicons:
  https://realfavicongenerator.net/

- Change the corresponding info in the `manifest.json` file,  create the images needed & upload them. Finally, create this file in the Checkout section and upload the content.

- Modify the `pwa-offline.html` template & upload it to the Checkout section.

- Upload the `service-worker.js` file to the Checkout section. Put the relevant files to be cached inside.

- Modify all the {{PROYECT}} related references in the Templates.


## Modifying Styles
- Changes the Primary colors for the site.
- Change the logo & the corresponding styles.
- Create any specific Proyect styles inside the OVERRIDE folder. All proyects styles copied inside the template files WILL BE OVERRIDEN without warning or permission.