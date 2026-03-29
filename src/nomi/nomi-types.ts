export interface Nomi {
  uuid: string;
  name: string;
  gender: string;
  created: string;
  relationshipType: string;
}

export interface Room {
  uuid: string;
  name: string;
  created: string;
  updated: string;
  status: string;
  backchannelingEnabled: boolean;
  nomis: Nomi[];
  note: string;
}

export interface ChatMessage {
  uuid: string;
  text: string;
  sent: string;
}

export interface SendMessageResponse {
  sentMessage: ChatMessage;
  replyMessage: ChatMessage;
}

export interface SendRoomMessageResponse {
  sentMessage: ChatMessage;
}

export interface ListNomisResponse {
  nomis: Nomi[];
}

export interface ListRoomsResponse {
  rooms: Room[];
}
