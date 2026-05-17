import { PlayerAttributes, PLAYERS, AttributeKey } from '../data/players';
import { Question, QUESTIONS } from '../data/questions';

export type UserAnswer = 'yes' | 'no' | 'maybe' | 'dont-know' | 'probably' | 'probably-not';

export interface PlayerProbability {
  player: PlayerAttributes;
  probability: number;
}

const ANSWER_LIKELIHOOD: Record<UserAnswer, { true: number, false: number }> = {
  'yes': { true: 0.999, false: 0.001 },
  'no': { true: 0.001, false: 0.999 },
  'probably': { true: 0.85, false: 0.15 },
  'probably-not': { true: 0.15, false: 0.85 },
  'maybe': { true: 0.5, false: 0.5 },
  'dont-know': { true: 0.5, false: 0.5 },
};

export class AkinatorEngine {
  private playerProbabilities: PlayerProbability[];
  private askedQuestionIds: Set<string> = new Set();
  private answers: Array<{ attribute: AttributeKey, answer: UserAnswer }> = [];

  constructor() {
    this.playerProbabilities = PLAYERS.map(player => ({
      player,
      probability: 1 / PLAYERS.length
    }));
  }

  public reset() {
    this.playerProbabilities = PLAYERS.map(player => ({
      player,
      probability: 1 / PLAYERS.length
    }));
    this.askedQuestionIds.clear();
    this.answers = [];
  }

  public getHistory() {
    return this.answers.map(a => ({
      question: QUESTIONS.find(q => q.attribute === a.attribute)?.text || '',
      answer: a.answer
    }));
  }

  public getAskedQuestionIds() {
    return Array.from(this.askedQuestionIds);
  }

  public getRemainingAttributes(): string[] {
    return QUESTIONS
      .filter(q => !this.askedQuestionIds.has(q.id))
      .map(q => q.attribute);
  }

  public getQuestionByAttribute(attribute: string): Question | null {
    const q = QUESTIONS.find(q => q.attribute === attribute);
    if (q && !this.askedQuestionIds.has(q.id)) return q;
    return null;
  }

  public getNextQuestion(): Question | null {
    const remainingQuestions = QUESTIONS.filter(q => !this.askedQuestionIds.has(q.id));
    if (remainingQuestions.length === 0) return null;

    // Use current probabilities to find the most "discriminating" question.
    let bestQuestion: Question | null = null;
    let minDiff = Infinity;

    // Consider top candidates to weight question selection
    const topCandidates = this.getTopCandidates(Math.max(5, Math.ceil(PLAYERS.length * 0.1)));

    for (const q of remainingQuestions) {
      const pYes = this.calculateWeightedProbabilityOfYes(q.attribute, topCandidates);
      const diff = Math.abs(pYes - 0.5);
      if (diff < minDiff) {
        minDiff = diff;
        bestQuestion = q;
      }
    }

    return bestQuestion;
  }

  private calculateWeightedProbabilityOfYes(attribute: AttributeKey, candidates: PlayerProbability[]): number {
    const totalProb = candidates.reduce((sum, c) => sum + c.probability, 0);
    if (totalProb === 0) return 0.5;
    
    return candidates.reduce((sum, pp) => {
      const playerValue = pp.player[attribute];
      const hasAttr = playerValue === true;
      return sum + (hasAttr ? pp.probability : 0);
    }, 0) / totalProb;
  }

  public updateProbabilities(question: Question, answer: UserAnswer) {
    this.askedQuestionIds.add(question.id);
    this.answers.push({ attribute: question.attribute, answer });
    
    const likelihoods = ANSWER_LIKELIHOOD[answer];
    
    let totalNewProb = 0;
    const newProbabilities = this.playerProbabilities.map(pp => {
      const playerValue = pp.player[question.attribute];
      
      let likelihood = 0.5;
      if (playerValue !== undefined && playerValue !== null) {
        likelihood = playerValue === true ? likelihoods.true : likelihoods.false;
      }

      // Hard constraint for Nationality if the user is certain (Yes/No)
      // This prevents SKY being picked for "Not Indian"
      if ((question.attribute === 'indian' || question.attribute === 'overseas') && (answer === 'yes' || answer === 'no')) {
         const isUserCertainNo = (answer === 'no');
         const playerMatches = (playerValue === !isUserCertainNo);
         if (!playerMatches) likelihood *= 0.1; // Extra penalty for nationality mismatch
      }

      const newProb = pp.probability * likelihood;
      totalNewProb += newProb;
      return { ...pp, probability: newProb };
    });

    // Normalize
    if (totalNewProb > 0) {
      this.playerProbabilities = newProbabilities.map(pp => ({
        ...pp,
        probability: pp.probability / totalNewProb
      }));
    }
  }

  public getTopCandidates(limit: number = 3): PlayerProbability[] {
    return [...this.playerProbabilities]
      .sort((a, b) => b.probability - a.probability)
      .slice(0, limit);
  }

  public getConfidence(): number {
    const top = this.getTopCandidates(1)[0];
    return top ? top.probability : 0;
  }

  public getProgress(): number {
    // Progress can be defined as how "concentrated" the probability distribution is.
    // Normalized entropy or just the top confidence.
    return Math.min(this.getConfidence() / 0.8, 1);
  }
}
