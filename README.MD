Atsidarius programą, įjunkite du terminalus ir prijunkite client bei server folderius. Tada, juos įjungus terminaluose, įrašykite "npm run dev".

Kol kas puslapis automatiškai susijungia su mano klasteriu Mongo Atlase, kuriame yra duomenų bazė sukūrta, bet norint naudotis savo klasteriu per Mongo Atlasa, reikia jį pakeisti.

Prie failų pridėtas duomenų bazės importas, bet svarbiausia, kad būtų sukurta duomenų bazė, po to visos kolekcijos, vartotojai, postai, ir t.t. yra sukuriama automatiškai naudojant programą.

Kad puslapiui naudotis, reikia susikurti vartotoją per registracijos puslapį, kuriam kaip ir kitiem puslapiam pridėtas nuvedančios nuorodos naudojant MainRouter.

Registracijoje svarbu, ar admino checkbox bus pažymėtas ar ne. Jeigu nėra pažymėtas, tada bus sukurtas paprastas vartotojas, kuris gali tik sukurti postus/renginius.

Sukurti renginiai turi laiką, kategoriją, pavadinimą ir turinį. Renginių kategorijos naudojamos filtruoti renginius.

Admin useriai gali prisijungti prie admin puslapio, kuriame yra check-as, prisijungus rodis visus postus adminams, kuriuos galima redaguoti arba ištrinti.

Paprastiems naudotojams bandant prisijungti prie admin puslapio rodoma "No Authorization", ir puslapis nerodomas.

Duomenų bazė yra sukurta naudojant MongoDB (nerealiacinė duomenų bazė), arba tiksliau, MongoDB Atlase.

Visų sukurtų naudotojų slaptažodžiai yra užšifruoti (encrypted), kad jie nebūtų matomi duomenų bazėje ar kitur.

Jeigu naudojate jau prijungta duomenu bazės klasteri tai yra du vartotojai "AdminTest" ir "NormalTest" AdminTest yra admino vartotojas jo slaptažodis yra "admin" o NormalTest yra paprastas vartotojas be jokiu "admin" autorizacijos.
