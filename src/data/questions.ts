import { AttributeKey } from './players';

export interface Question {
  id: string;
  text: string;
  attribute: AttributeKey;
}

export const QUESTIONS: Question[] = [
  { id: 'q1', text: 'Is your player Indian?', attribute: 'indian' },
  { id: 'q2', text: 'Is your player an overseas player?', attribute: 'overseas' },
  { id: 'q3', text: 'Does your player have a primary role of a Batsman?', attribute: 'batsman' },
  { id: 'q4', text: 'Is your player primarily a Bowler?', attribute: 'bowler' },
  { id: 'q5', text: 'Is your player an All-rounder?', attribute: 'all_rounder' },
  { id: 'q6', text: 'Is your player a Wicketkeeper?', attribute: 'wicketkeeper' },
  { id: 'q7', text: 'Is your player left-handed?', attribute: 'left_handed' },
  { id: 'q8', text: 'Is your player right-handed?', attribute: 'right_handed' },
  { id: 'q9', text: 'Is your player a fast bowler?', attribute: 'fast_bowler' },
  { id: 'q10', text: 'Is your player a spinner?', attribute: 'spinner' },
  { id: 'q11', text: 'Is your player a left-arm bowler?', attribute: 'left_arm_bowler' },
  { id: 'q12', text: 'Is your player a right-arm bowler?', attribute: 'right_arm_bowler' },
  { id: 'q13', text: 'Is your player currently active in IPL?', attribute: 'active' },
  { id: 'q14', text: 'Is your player retired from IPL?', attribute: 'retired' },
  { id: 'q15', text: 'Has your player been a Captain in IPL?', attribute: 'captain' },
  { id: 'q16', text: 'Has your player won an IPL trophy?', attribute: 'won_ipl' },
  { id: 'q17', text: 'Has your player won the Orange Cap?', attribute: 'orange_cap' },
  { id: 'q18', text: 'Has your player won the Purple Cap?', attribute: 'purple_cap' },
  { id: 'q19', text: 'Is your player an Opener?', attribute: 'opener' },
  { id: 'q20', text: 'Does your player play in the Top Order?', attribute: 'top_order' },
  { id: 'q21', text: 'Does your player play in the Middle Order?', attribute: 'middle_order' },
  { id: 'q22', text: 'Is your player known as a Finisher?', attribute: 'finisher' },
  { id: 'q23', text: 'Did your player debut before 2010?', attribute: 'debut_before_2010' },
  { id: 'q24', text: 'Did your player debut before 2015?', attribute: 'debut_before_2015' },
  { id: 'q25', text: 'Is your player over 35 years old?', attribute: 'above_35' },
  { id: 'q26', text: 'Has your player played for CSK?', attribute: 'csk' },
  { id: 'q27', text: 'Has your player played for Mumbai Indians?', attribute: 'mi' },
  { id: 'q28', text: 'Has your player played for RCB?', attribute: 'rcb' },
  { id: 'q29', text: 'Has your player played for KKR?', attribute: 'kkr' },
  { id: 'q30', text: 'Has your player played for Sunrisers Hyderabad?', attribute: 'srh' },
  { id: 'q31', text: 'Has your player played for Delhi Capitals?', attribute: 'dc' },
  { id: 'q32', text: 'Has your player played for Rajasthan Royals?', attribute: 'rr' },
  { id: 'q33', text: 'Has your player played for Punjab Kings?', attribute: 'pbks' },
  { id: 'q34', text: 'Has your player played for Gujarat Titans?', attribute: 'gt' },
  { id: 'q35', text: 'Has your player played for Lucknow Super Giants?', attribute: 'lsg' },
  { id: 'q36', text: 'Is your player married?', attribute: 'married' },
  { id: 'q37', text: 'Is your player well known for a specific iconic jersey number?', attribute: 'jersey_known' },
  { id: 'q38', text: 'Does your player have a very famous nickname (e.g. King, Thala, Hitman)?', attribute: 'famous_nickname' },
  { id: 'q39', text: 'Is your player under 25 years old?', attribute: 'under_25' },
];
