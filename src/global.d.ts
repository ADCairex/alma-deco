import messages from '../messages/es.json';

type Messages = typeof messages;

declare global {
  interface IntlMessages extends Messages {}
}
