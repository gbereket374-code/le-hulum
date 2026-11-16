# FR-SL-04: Roots come from the shared morphological analyser.
def roots(token):
    from api.ethsl.morph import lemma
    gloss, _ambiguous = lemma(token)
    return gloss
