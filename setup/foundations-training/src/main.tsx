import React from 'react';
import {createRoot} from 'react-dom/client';
import Player from './player';
import MemberLogin from './member-login';
import {emailLoginMode} from './member-session';
import './style.css';
createRoot(document.getElementById('root')!).render(emailLoginMode()?<MemberLogin><Player/></MemberLogin>:<Player/>);

