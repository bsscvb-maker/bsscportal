import {build} from 'vite';
await build({root:import.meta.dirname,base:'./',build:{outDir:'dist',emptyOutDir:true},esbuild:{jsx:'automatic'}});
