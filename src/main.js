import './styles/tokens.css';
import './styles/base.css';
import './styles/deck.css';
import './styles/code.css';
import './styles/components.css';
import './styles/slides.css';
import './styles/demos.css';
import './slides/monitors.css';
import './styles/theme.css';
import './styles/refresh.css';
import './styles/ts.css';
import { Deck } from './deck/Deck.js';
import { slides } from './slides/index.js';

const deck = new Deck(document.getElementById('stage'), slides);
deck.init();

// handy for review / automated checks
window.__deck = deck;
