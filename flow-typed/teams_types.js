// @flow

export type Teams$TeamMemberActions = {
   currentRole: string,
   teamUserId: number,
   disable: boolean
}

export type Teams$TeamMember = {
  actions: Teams$TeamMemberActions,
  created_at: string,
  email: string,
  id: number,
  name: string,
  role: string,
  status: string
};

export type Teams$NewTeam = {
  name: string,
  description: string
};

export type Teams$Team = {
  id: number,
  name: string,
  current_team: boolean,
  role: string,
  members: number,
  can_be_leaved: boolean,
  user_team_id: number
};
