// Creator earnings DTOs for the "My Sources" view. Money fields are strings to
// preserve Decimal precision (see CLAUDE.md §9 note on money as strings).

export type SourceEarnings = {
  sourceId: string;
  title: string;
  uses: number;
  earned: string;
};

export type CreatorEarnings = {
  perSource: SourceEarnings[];
  totalEarned: string;
  totalUses: number;
};
