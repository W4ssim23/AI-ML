from aima3.logic import *
from aima3.utils import *

kb = FolKB()

kb.tell(expr('Homme(Jean)'))
kb.tell(expr('Homme(Fabian)')) 
kb.tell(expr('Homme(Franck)'))
kb.tell(expr('Homme(Jerome)'))
kb.tell(expr('Homme(Bruno)'))
kb.tell(expr('Femme(Evelyne)'))
kb.tell(expr('Femme(Louise)'))
kb.tell(expr('Femme(Marie)'))
kb.tell(expr('Femme(Eve)'))
kb.tell(expr('Femme(Sophie)'))

kb.tell(expr('Parent(Jean, Fabian)'))
kb.tell(expr('Parent(Fabian , Louise)'))
kb.tell(expr('Parent(Louise, Jerome)'))
kb.tell(expr('Parent(Louise, Sophie)'))
kb.tell(expr('Parent(Louise, Marie)'))
kb.tell(expr('Parent(Jerome, Franck)'))
kb.tell(expr('Parent(Sophie, Bruno)'))
kb.tell(expr('Parent(Sophie, Marie)'))
kb.tell(expr('Parent(Sophie, Eve)'))

kb.tell(expr(' Parent(x,y) & Femme(x) ==> Mere(x,y)'))
kb.tell(expr(' Parent(x,y) & Homme(x) ==> Pere(x,y)'))
kb.tell(expr(' Parent(z,x) & Parent(z,y) ==> FrereSoeur(x,y)'))
kb.tell(expr(' FrereSoeur(x,y) & Homme(x) ==> Frere(x,y)'))
kb.tell(expr('FrereSoeur(x,y) & Femme(x) ==> Soeur(x,y)'))
kb.tell(expr(' Parent(z,y) & Frere(z,x) ==> Oncle(z,x)'))
kb.tell(expr('Parent(z,y) & Soeur(z,x) ==> Tante(x,y)'))
kb.tell(expr(' Parent(z,y) & Oncle(z,x) ==> Cousin(x,y)'))
kb.tell(expr('Parent(x,y) ==> Ancetre(x,y)'))
kb.tell(expr('Parent(x,z) & Ancetre(z,y) ==> Ancetre(x,y)'))


print(bool(kb.ask(expr('Ancetre(Jean, Franck)'))))

