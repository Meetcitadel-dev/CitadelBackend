// Import all models to ensure they are initialized
import User from './user.model';
import University from './university.model';
import UserImage from './userImage.model';
import Connection from './connection.model';
import AdjectiveMatch from './adjectiveMatch.model';
import AdjectiveSelection from './adjectiveSelection.model';
import Match from './match.model';
import Interaction from './interaction.model';
import ConnectionRequest from './connectionRequest.model';
import NotificationReadStatus from './notificationReadStatus.model';
import Conversation from './conversation.model';
import Message from './message.model';
import UserOnlineStatus from './userOnlineStatus.model';
import Booking from './booking.model';
import Payment from './payment.model';
import Event from './event.model';

// Import associations (will be set up in server.ts)
import { setupAssociations } from './associations';

// Export all models
export {
  User,
  University,
  UserImage,
  Connection,
  AdjectiveMatch,
  AdjectiveSelection,
  Match,
  Interaction,
  ConnectionRequest,
  NotificationReadStatus,
  Conversation,
  Message,
  UserOnlineStatus,
  Booking,
  Payment,
  Event
}; 