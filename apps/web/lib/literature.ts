export type LiteratureSection = {
  id: string;
  title: string;
  markdown: string;
};

export type LiteraturePaper = {
  id: string;
  href?: string;
  date: string;
  category: string;
  title: string;
  subtitle: string;
  authors: string;
  source: string;
  sections: LiteratureSection[];
};

export const samplePaper: LiteraturePaper = {
  id: "compactness-in-finite-graphs",
  date: "Sep 19, 2026",
  category: "Research note",
  title: "A compactness principle for finite graph witnesses",
  subtitle:
    "A worked example of how a research episode becomes a readable mathematical artifact.",
  authors: "Triviality Research Runtime",
  source: "Sample paper",
  sections: [
    {
      id: "abstract",
      title: "Abstract",
      markdown: String.raw`We study when a finite witness can be preserved while a graph is transformed. The central observation is that a bounded family of local certificates can be assembled into a global certificate whenever the transformation preserves adjacency constraints. The note is intentionally small: it demonstrates the reader format used for generated literature, including inline mathematics such as $\lvert V(G)\rvert$ and displayed equations.`,
    },
    {
      id: "motivation",
      title: "Motivation",
      markdown: String.raw`A research system should make the path from a question to a useful reading note visible. Suppose $G=(V,E)$ is a finite graph and each vertex $v$ carries a witness $w_v$. We ask whether a transformation $T$ can preserve enough of those witnesses to reconstruct a certificate for $T(G)$.`,
    },
    {
      id: "setup",
      title: "1. Setup",
      markdown: String.raw`Let $\mathcal{W}(G)$ denote the set of witness assignments satisfying the local compatibility condition. We use the following simple definition.

> **Definition.** A map $T:G\to H$ is witness-preserving if every $w\in\mathcal{W}(G)$ induces a witness $T_\ast w\in\mathcal{W}(H)$.

The finite setting matters because a witness assignment can be represented by a finite tuple. In later work, the same language could be lifted to a compact topological space of assignments.`,
    },
    {
      id: "main-result",
      title: "2. Main result",
      markdown: String.raw`**Proposition.** Let $G$ and $H$ be finite graphs and let $T:G\to H$ be a witness-preserving transformation. If every induced subgraph of $G$ admits a compatible witness, then $H$ admits a compatible witness.

The proof is a finite gluing argument. Enumerate the vertices of $H$ as $v_1,\ldots,v_n$ and choose a witness for each finite restriction. Compatibility ensures that the choices agree on overlaps, so the final assignment is well-defined:

$$
  w_H(v_i)=T_\ast\bigl(w_G\vert_{T^{-1}(v_i)}\bigr).
$$

The proposition is deliberately weaker than a full compactness theorem, but it gives a testable invariant for the research runtime.`,
    },
    {
      id: "proof-sketch",
      title: "3. Proof sketch",
      markdown: String.raw`For each $k\leq n$, let $G_k$ be the subgraph induced by the first $k$ fibers of $T$. By hypothesis there is a compatible witness $w_k$ on $G_k$. Since the family is finite, we may choose a maximal chain under restriction. The union of that chain is a witness on all of $G$; applying $T_\ast$ gives a witness on $H$.

The only nontrivial step is checking that an edge crossing two fibers is not assigned incompatible values. This is exactly where preservation of adjacency enters. If the transformation does not preserve the relevant relation, a counterexample can be constructed from a two-vertex graph.`,
    },
    {
      id: "limitations",
      title: "4. Limitations and next directions",
      markdown: String.raw`The argument uses finiteness twice: to enumerate the target and to turn compatible restrictions into a total assignment. For infinite graphs, one would need an additional compactness hypothesis, such as a compact witness space or a finite-intersection property.

The next useful experiment is therefore to test the weakened statement

$$
  \text{local witnesses} + \text{finite intersection property}
  \Longrightarrow \text{global witness}.
$$

That direction is a candidate for a formal Lean lemma and for a cross-domain comparison with ultrafilter arguments in topology.`,
    },
    {
      id: "references",
      title: "References",
      markdown:
        "This sample is generated for the Triviality literature reader. In a completed research episode, this section is populated from the papers and formal artifacts attached to the episode.",
    },
  ],
};

export function getLiteraturePaper(id: string): LiteraturePaper | null {
  return id === samplePaper.id ? samplePaper : null;
}
