// Static sentence pairs for Lessons 6–15 of Colloquial Spanish.
// Translated directly from the book text — no AI API involved.
// Format: { lesson, dialogue, speaker, spanish, english }
// dialogue 1/2 = Dialogue 1/2; dialogue 3 = Reading section

export interface StaticPair {
  lesson: number;
  dialogue: number;
  speaker: string;
  spanish: string;
  english: string;
}

export const STATIC_PAIRS: StaticPair[] = [
  // ───────────────────────────────────────────────
  // LESSON 6 — Eating Out
  // ───────────────────────────────────────────────

  // Dialogue 1 — Dining out
  { lesson: 6, dialogue: 1, speaker: 'LUIS',     spanish: '¿Cenamos esta noche fuera?', english: 'Shall we eat out tonight?' },
  { lesson: 6, dialogue: 1, speaker: 'SUSANNA',  spanish: '¡Qué buena idea!', english: 'What a great idea!' },
  { lesson: 6, dialogue: 1, speaker: 'PEDRO',    spanish: 'Bien, pero tiene que ser un restaurante económico, no tengo mucho dinero.', english: 'Fine, but it has to be a cheap restaurant, I haven\'t got much money.' },
  { lesson: 6, dialogue: 1, speaker: 'PEDRO',    spanish: 'Y además, recordad que no me gusta nada comer donde se puede fumar.', english: 'And besides, remember I really don\'t like eating where people can smoke.' },
  { lesson: 6, dialogue: 1, speaker: 'LUIS',     spanish: '¡Tú como siempre! ¿Qué os parece el mesón que acaban de abrir en la Calle Serrano?', english: 'You\'re always the same! What do you think of the tavern that has just opened in Calle Serrano?' },
  { lesson: 6, dialogue: 1, speaker: 'PEDRO',    spanish: '¿Es barato?', english: 'Is it cheap?' },
  { lesson: 6, dialogue: 1, speaker: 'LUIS',     spanish: 'Sí, creo que sí y no se puede fumar. Tranquilo.', english: 'Yes, I think so, and you can\'t smoke there. Don\'t worry.' },
  { lesson: 6, dialogue: 1, speaker: 'SUSANNA',  spanish: '¿A qué hora quedamos?', english: 'What time shall we meet?' },
  { lesson: 6, dialogue: 1, speaker: 'PEDRO',    spanish: 'A las nueve y media, ¿os va bien?', english: 'Half past nine — does that suit you?' },
  { lesson: 6, dialogue: 1, speaker: 'LUIS',     spanish: 'A mí sí. ¿Y a ti, Susana?', english: 'That suits me. And you, Susanna?' },
  { lesson: 6, dialogue: 1, speaker: 'SUSANNA',  spanish: 'A mí también.', english: 'Me too.' },
  { lesson: 6, dialogue: 1, speaker: 'PEDRO',    spanish: 'Vale, a las nueve y media en el bar \'Manolo\'.', english: 'OK, half past nine at the bar \'Manolo\'.' },

  // Dialogue 2 — At the restaurant
  { lesson: 6, dialogue: 2, speaker: 'LUIS',      spanish: '¿Tienen una mesa libre para tres personas, por favor?', english: 'Do you have a free table for three people, please?' },
  { lesson: 6, dialogue: 2, speaker: 'CAMARERA',  spanish: '¿Dónde la quieren, al lado de la ventana o al fondo?', english: 'Where would you like it, by the window or at the back?' },
  { lesson: 6, dialogue: 2, speaker: 'PEDRO',     spanish: 'La queremos allí donde no se puede fumar. Gracias.', english: 'We want it where you can\'t smoke. Thank you.' },
  { lesson: 6, dialogue: 2, speaker: 'LUIS',      spanish: '¿Nos trae la carta, por favor?', english: 'Could you bring us the menu, please?' },
  { lesson: 6, dialogue: 2, speaker: 'PEDRO',     spanish: '¿Qué nos recomienda? ¿Cuál es la especialidad de la casa?', english: 'What do you recommend? What is the speciality of the house?' },
  { lesson: 6, dialogue: 2, speaker: 'CAMARERA',  spanish: 'De pescado les puedo recomendar el rape y el lenguado, y de carnes, hay cordero asado muy bueno.', english: 'For fish I can recommend the monkfish and the sole, and for meat, there is very good roast lamb.' },
  { lesson: 6, dialogue: 2, speaker: 'PEDRO',     spanish: 'Bien, gracias. Mientras decidimos, ¿nos trae una botella de vino tinto, por favor?', english: 'Good, thank you. While we decide, could you bring us a bottle of red wine, please?' },
  { lesson: 6, dialogue: 2, speaker: 'CAMARERA',  spanish: '¿El vino de la casa?', english: 'The house wine?' },
  { lesson: 6, dialogue: 2, speaker: 'PEDRO',     spanish: 'Sí.', english: 'Yes.' },

  // ───────────────────────────────────────────────
  // LESSON 7 — At the Doctor
  // ───────────────────────────────────────────────

  // Dialogue 1
  { lesson: 7, dialogue: 1, speaker: 'SARA',   spanish: 'Hola Vicky. ¿Qué tal estás? Hace mucho que no te veo.', english: 'Hi Vicky. How are you? I haven\'t seen you in a long time.' },
  { lesson: 7, dialogue: 1, speaker: 'VICKY',  spanish: 'Pues no muy bien. Desde hace dos días tengo un dolor de cabeza increíble.', english: 'Not very well. I\'ve had a terrible headache for two days.' },
  { lesson: 7, dialogue: 1, speaker: 'SARA',   spanish: '¿Has ido al médico?', english: 'Have you been to the doctor?' },
  { lesson: 7, dialogue: 1, speaker: 'VICKY',  spanish: 'No.', english: 'No.' },
  { lesson: 7, dialogue: 1, speaker: 'SARA',   spanish: '¿Por qué no?', english: 'Why not?' },
  { lesson: 7, dialogue: 1, speaker: 'VICKY',  spanish: 'Es que odio las consultas de médicos. Además como sólo llevo aquí dos meses, no tengo médico de cabecera.', english: 'The thing is I hate doctors\' surgeries. Also, as I\'ve only been here two months, I don\'t have a GP.' },
  { lesson: 7, dialogue: 1, speaker: 'SARA',   spanish: 'Pero mujer, si vas al médico puedes tomar algo y ponerte bien antes. ¿Por qué no vas a mi médico?', english: 'Come on, if you go to the doctor you can take something and get better sooner. Why don\'t you go to my doctor?' },
  { lesson: 7, dialogue: 1, speaker: 'VICKY',  spanish: 'Vale, pero, ¿te importa venir conmigo?', english: 'OK, but do you mind coming with me?' },
  { lesson: 7, dialogue: 1, speaker: 'SARA',   spanish: 'No, claro que no. ¿Vamos esta tarde?', english: 'No, of course not. Shall we go this afternoon?' },
  { lesson: 7, dialogue: 1, speaker: 'VICKY',  spanish: 'De acuerdo. ¿Te importa llamar tú por teléfono para pedir hora?', english: 'All right. Do you mind phoning to make an appointment?' },
  { lesson: 7, dialogue: 1, speaker: 'SARA',   spanish: 'Claro que no, llamo ahora.', english: 'Of course not, I\'ll call now.' },

  // Dialogue 2 — At the doctor's
  { lesson: 7, dialogue: 2, speaker: 'DOCTOR', spanish: 'Buenas tardes, pase y siéntese por favor. Bien, dígame.', english: 'Good afternoon, come in and sit down please. Now, tell me.' },
  { lesson: 7, dialogue: 2, speaker: 'VICKY',  spanish: 'Mire, me duele muchísimo la cabeza. Creo que tengo fiebre y además me duelen hasta los huesos.', english: 'Look, I have a terrible headache. I think I have a fever and my whole body aches.' },
  { lesson: 7, dialogue: 2, speaker: 'DOCTOR', spanish: '¿Desde cuándo se siente así?', english: 'How long have you been feeling like this?' },
  { lesson: 7, dialogue: 2, speaker: 'VICKY',  spanish: 'Desde hace dos días.', english: 'For two days.' },
  { lesson: 7, dialogue: 2, speaker: 'DOCTOR', spanish: 'Bien, déjeme examinarla... Sí, tiene usted la gripe.', english: 'Right, let me examine you... Yes, you have the flu.' },
  { lesson: 7, dialogue: 2, speaker: 'DOCTOR', spanish: 'No es grave, lo mejor que puede hacer usted es irse a la cama y quedarse allí unos días.', english: 'It\'s not serious, the best thing you can do is go to bed and stay there for a few days.' },
  { lesson: 7, dialogue: 2, speaker: 'DOCTOR', spanish: 'Si después de una semana no se siente mejor, vuelva.', english: 'If you don\'t feel better after a week, come back.' },
  { lesson: 7, dialogue: 2, speaker: 'VICKY',  spanish: '¿Tengo que tomar algo?', english: 'Do I have to take anything?' },
  { lesson: 7, dialogue: 2, speaker: 'DOCTOR', spanish: 'Sí, le voy a recetar unos antibióticos. ¿Es usted alérgica a la penicilina?', english: 'Yes, I\'m going to prescribe some antibiotics. Are you allergic to penicillin?' },
  { lesson: 7, dialogue: 2, speaker: 'VICKY',  spanish: 'No.', english: 'No.' },
  { lesson: 7, dialogue: 2, speaker: 'DOCTOR', spanish: 'Aquí tiene la receta.', english: 'Here is the prescription.' },
  { lesson: 7, dialogue: 2, speaker: 'VICKY',  spanish: 'Muchas gracias, adiós.', english: 'Thank you very much, goodbye.' },

  // Reading — Jamie at the doctor
  { lesson: 7, dialogue: 3, speaker: 'MÉDICO', spanish: '¿Qué le pasa?', english: 'What\'s the matter?' },
  { lesson: 7, dialogue: 3, speaker: 'JAMIE',  spanish: 'Mire, doctor, que estoy muy malito.', english: 'Look, doctor, I\'m feeling very unwell.' },
  { lesson: 7, dialogue: 3, speaker: 'MÉDICO', spanish: '¿Qué le duele?', english: 'What hurts?' },
  { lesson: 7, dialogue: 3, speaker: 'JAMIE',  spanish: 'Doler, doler, nada, pero no me encuentro bien.', english: 'Nothing actually hurts, but I don\'t feel well.' },
  { lesson: 7, dialogue: 3, speaker: 'MÉDICO', spanish: 'Vamos a ver, ¿fuma usted?', english: 'Let\'s see, do you smoke?' },
  { lesson: 7, dialogue: 3, speaker: 'JAMIE',  spanish: 'Pues sí, doctor.', english: 'Well yes, doctor.' },
  { lesson: 7, dialogue: 3, speaker: 'MÉDICO', spanish: '¿Desde cuándo fuma?', english: 'How long have you been smoking?' },
  { lesson: 7, dialogue: 3, speaker: 'JAMIE',  spanish: 'Desde hace veinte años.', english: 'For twenty years.' },
  { lesson: 7, dialogue: 3, speaker: 'MÉDICO', spanish: '¿Cuántos cigarrillos fuma al día?', english: 'How many cigarettes do you smoke a day?' },
  { lesson: 7, dialogue: 3, speaker: 'JAMIE',  spanish: 'Un paquete más o menos.', english: 'About a packet.' },
  { lesson: 7, dialogue: 3, speaker: 'MÉDICO', spanish: 'Y ¿bebe usted?', english: 'And do you drink?' },
  { lesson: 7, dialogue: 3, speaker: 'JAMIE',  spanish: 'Un poco sólo, normalmente bebo vino con las comidas, unas cervezas con los amigos después del trabajo, y una copita después de cenar.', english: 'Just a little, normally I have wine with meals, a few beers with friends after work, and a small drink after dinner.' },
  { lesson: 7, dialogue: 3, speaker: 'MÉDICO', spanish: '¿Hace usted algún deporte?', english: 'Do you do any sport?' },
  { lesson: 7, dialogue: 3, speaker: 'JAMIE',  spanish: 'Deporte, deporte no, pero de vez en cuando voy al monte.', english: 'Not really sport as such, but I sometimes go hiking.' },
  { lesson: 7, dialogue: 3, speaker: 'MÉDICO', spanish: 'Mire, señor. Deje de fumar, deje de beber, haga un poco de ejercicio y si todavía no se encuentra bien, vuelva de nuevo.', english: 'Look, sir. Stop smoking, stop drinking, do some exercise and if you still don\'t feel well, come back again.' },
  { lesson: 7, dialogue: 3, speaker: 'JAMIE',  spanish: '¿Eso es todo...?', english: 'Is that all...?' },
  { lesson: 7, dialogue: 3, speaker: 'MÉDICO', spanish: 'Bueno, si puede vaya a vivir al campo.', english: 'Well, if you can, go and live in the countryside.' },

  // ───────────────────────────────────────────────
  // LESSON 8 — Flat-Hunting
  // ───────────────────────────────────────────────

  // Dialogue 1 — At the estate agency
  { lesson: 8, dialogue: 1, speaker: 'LESLEY Y MIKE', spanish: 'Buenos días.', english: 'Good morning.' },
  { lesson: 8, dialogue: 1, speaker: 'EMPLEADO',      spanish: 'Buenos días, siéntense por favor. ¿En qué les puedo servir?', english: 'Good morning, please sit down. How can I help you?' },
  { lesson: 8, dialogue: 1, speaker: 'LESLEY',        spanish: 'Mire, vivimos ahora en un piso en el centro de Madrid, pero queremos mudarnos porque es muy caro y no podemos pagar el alquiler.', english: 'Look, we\'re living in a flat in the centre of Madrid, but we want to move because it\'s very expensive and we can\'t pay the rent.' },
  { lesson: 8, dialogue: 1, speaker: 'EMPLEADO',      spanish: 'Bien, ¿dónde les gustaría vivir?', english: 'Fine, where would you like to live?' },
  { lesson: 8, dialogue: 1, speaker: 'LESLEY',        spanish: 'Preferiríamos vivir no muy lejos del centro.', english: 'We\'d prefer to live not too far from the centre.' },
  { lesson: 8, dialogue: 1, speaker: 'EMPLEADO',      spanish: 'Bien. ¿Cuánto pueden pagar al mes?', english: 'Fine. How much can you pay per month?' },
  { lesson: 8, dialogue: 1, speaker: 'LESLEY',        spanish: 'Como máximo 600 euros.', english: '600 euros at most.' },
  { lesson: 8, dialogue: 1, speaker: 'EMPLEADO',      spanish: 'Por este precio saben que no hay pisos grandes. Tiene que ser un apartamento de un dormitorio.', english: 'At this price you know there are no large flats. It has to be a one-bedroom apartment.' },
  { lesson: 8, dialogue: 1, speaker: 'LESLEY',        spanish: 'Sí, no importa.', english: 'Yes, that doesn\'t matter.' },
  { lesson: 8, dialogue: 1, speaker: 'EMPLEADO',      spanish: 'Hay uno en la calle Suero de Quiñones. Es muy pequeño pero está recién pintado y es bonito. ¿Quieren ir a verlo?', english: 'There\'s one in Calle Suero de Quiñones. It\'s very small but it\'s just been painted and it\'s nice. Do you want to go and see it?' },
  { lesson: 8, dialogue: 1, speaker: 'LESLEY',        spanish: 'Sí, claro.', english: 'Yes, of course.' },

  // Dialogue 2 — Viewing the flat
  { lesson: 8, dialogue: 2, speaker: 'EMPLEADO', spanish: 'Es un cuarto piso pero hay ascensor. ¡Oh, no! el ascensor no funciona. Lo siento pero tenemos que subir andando.', english: 'It\'s on the fourth floor but there\'s a lift. Oh no! The lift isn\'t working. I\'m sorry but we\'ll have to walk up.' },
  { lesson: 8, dialogue: 2, speaker: 'LESLEY',   spanish: 'No importa, un poco de ejercicio nunca ha hecho daño a nadie.', english: 'It doesn\'t matter, a little exercise never hurt anyone.' },
  { lesson: 8, dialogue: 2, speaker: 'EMPLEADO', spanish: 'Aquí es. Como ve, el piso es pequeño pero está muy limpio. Además tiene mucha luz.', english: 'Here it is. As you can see, the flat is small but it\'s very clean. It also gets lots of light.' },
  { lesson: 8, dialogue: 2, speaker: 'LESLEY',   spanish: 'Sí, las ventanas son muy grandes. ¿Dónde está la cocina?', english: 'Yes, the windows are very large. Where\'s the kitchen?' },
  { lesson: 8, dialogue: 2, speaker: 'EMPLEADO', spanish: 'Al fondo, a la izquierda, al lado del comedor.', english: 'At the back, on the left, next to the dining room.' },
  { lesson: 8, dialogue: 2, speaker: 'LESLEY',   spanish: '¡Ah, sí! Es pequeña pero me gusta.', english: 'Ah yes! It\'s small but I like it.' },
  { lesson: 8, dialogue: 2, speaker: 'MIKE',     spanish: 'A mí también. Es moderna. Y el cuarto de baño, ¿dónde está?', english: 'Me too. It\'s modern. And the bathroom, where is it?' },
  { lesson: 8, dialogue: 2, speaker: 'EMPLEADO', spanish: 'Allí enfrente. Y el dormitorio está aquí a la derecha.', english: 'Over there opposite. And the bedroom is here on the right.' },
  { lesson: 8, dialogue: 2, speaker: 'LESLEY',   spanish: 'El cuarto de baño sólo tiene ducha y bidé pero es alegre. Por cierto, ¿hay calefacción central?', english: 'The bathroom only has a shower and bidet but it\'s bright. By the way, is there central heating?' },
  { lesson: 8, dialogue: 2, speaker: 'EMPLEADO', spanish: 'No, pero hay estufas en todas las habitaciones.', english: 'No, but there are heaters in all the rooms.' },
  { lesson: 8, dialogue: 2, speaker: 'LESLEY',   spanish: 'Bien, nos gusta bastante pero si no le importa me gustaría hablarlo con mi marido a solas.', english: 'Good, we quite like it but if you don\'t mind, I\'d like to discuss it with my husband in private.' },
  { lesson: 8, dialogue: 2, speaker: 'EMPLEADO', spanish: 'Sí, claro. Pasen por la oficina después.', english: 'Yes, of course. Come by the office afterwards.' },

  // Reading — Marisol and Lesley
  { lesson: 8, dialogue: 3, speaker: 'MARISOL', spanish: '¿Vives en un piso o en una casa?', english: 'Do you live in a flat or a house?' },
  { lesson: 8, dialogue: 3, speaker: 'LESLEY',  spanish: 'En una casa.', english: 'In a house.' },
  { lesson: 8, dialogue: 3, speaker: 'MARISOL', spanish: '¿Es grande?', english: 'Is it big?' },
  { lesson: 8, dialogue: 3, speaker: 'LESLEY',  spanish: 'Sí, bastante. Tiene dos plantas. En la primera planta hay tres dormitorios bastante grandes y un estudio. En la planta baja hay una cocina grande, un comedor y un salón muy grande.', english: 'Yes, quite. It has two floors. On the first floor there are three quite large bedrooms and a study. On the ground floor there is a large kitchen, a dining room and a very large living room.' },
  { lesson: 8, dialogue: 3, speaker: 'MARISOL', spanish: '¿Está cerca de la playa?', english: 'Is it near the beach?' },
  { lesson: 8, dialogue: 3, speaker: 'LESLEY',  spanish: 'Sí, a unos cien metros, pero hay también piscina.', english: 'Yes, about a hundred metres away, and there\'s also a swimming pool.' },
  { lesson: 8, dialogue: 3, speaker: 'MARISOL', spanish: '¡Qué suerte!', english: 'How lucky!' },
  { lesson: 8, dialogue: 3, speaker: 'LESLEY',  spanish: 'Sí, pero no es mía, es de unos amigos que están ahora en Londres.', english: 'Yes, but it\'s not mine, it belongs to some friends who are in London now.' },
  { lesson: 8, dialogue: 3, speaker: 'MARISOL', spanish: '¿Hasta cuándo vas a estar?', english: 'How long are you staying?' },
  { lesson: 8, dialogue: 3, speaker: 'LESLEY',  spanish: 'Hasta julio.', english: 'Until July.' },

  // ───────────────────────────────────────────────
  // LESSON 9 — On the Phone
  // ───────────────────────────────────────────────

  // Dialogue 1 — Phoning a friend
  { lesson: 9, dialogue: 1, speaker: 'MADRE', spanish: '¿Diga?', english: 'Hello?' },
  { lesson: 9, dialogue: 1, speaker: 'PAUL',  spanish: 'Hola, buenas tardes, ¿está Irene?', english: 'Hello, good afternoon, is Irene there?' },
  { lesson: 9, dialogue: 1, speaker: 'MADRE', spanish: 'Sí, un momento. Voy a ver lo que está haciendo.', english: 'Yes, one moment. I\'ll go and see what she\'s doing.' },
  { lesson: 9, dialogue: 1, speaker: 'MADRE', spanish: 'Irene, al teléfono.', english: 'Irene, phone!' },
  { lesson: 9, dialogue: 1, speaker: 'IRENE', spanish: '¿Sí?', english: 'Yes?' },
  { lesson: 9, dialogue: 1, speaker: 'PAUL',  spanish: 'Hola Irene, soy Paul. Mira, te llamo porque están dando un programa sobre el 11 M.', english: 'Hi Irene, it\'s Paul. Look, I\'m calling you because there\'s a programme on about 11 March.' },
  { lesson: 9, dialogue: 1, speaker: 'IRENE', spanish: 'Sí, ya lo sé, lo estoy viendo.', english: 'Yes, I know, I\'m watching it.' },
  { lesson: 9, dialogue: 1, speaker: 'PAUL',  spanish: 'Entonces no te molesto. Te llamo después para hablar del programa. ¿Vale?', english: 'Then I won\'t disturb you. I\'ll call you later to talk about the programme. OK?' },
  { lesson: 9, dialogue: 1, speaker: 'IRENE', spanish: 'De acuerdo, hasta luego.', english: 'Fine, bye.' },

  // Dialogue 2 — Business phone call
  { lesson: 9, dialogue: 2, speaker: 'SECRETARIA', spanish: 'Constructora Mesal, ¿dígame?', english: 'Constructora Mesal, can I help you?' },
  { lesson: 9, dialogue: 2, speaker: 'MR OLIVER',  spanish: '¿Podría hablar con el señor López, por favor?', english: 'Could I speak to Mr López, please?' },
  { lesson: 9, dialogue: 2, speaker: 'SECRETARIA', spanish: 'Un momento, por favor. ¿De parte de quién?', english: 'One moment, please. Who\'s calling?' },
  { lesson: 9, dialogue: 2, speaker: 'MR OLIVER',  spanish: 'Del señor Oliver, de la compañía Olympia.', english: 'Mr Oliver from the Olympia company.' },
  { lesson: 9, dialogue: 2, speaker: 'SECRETARIA', spanish: 'Ahora le pongo.', english: 'I\'ll put you through now.' },
  { lesson: 9, dialogue: 2, speaker: 'SECRETARIA', spanish: 'Perdone, señor Oliver, pero el señor López está en una reunión. Si me da su número de teléfono, le llama dentro de una hora.', english: 'Excuse me, Mr Oliver, but Mr López is in a meeting. If you give me your telephone number, he will call you within an hour.' },
  { lesson: 9, dialogue: 2, speaker: 'MR OLIVER',  spanish: 'Bien, mi móvil es el 635483743.', english: 'Fine, my mobile number is 635483743.' },
  { lesson: 9, dialogue: 2, speaker: 'SECRETARIA', spanish: 'Muy bien, entonces luego le llama.', english: 'Very well, he will call you later then.' },
  { lesson: 9, dialogue: 2, speaker: 'MR OLIVER',  spanish: 'Gracias.', english: 'Thank you.' },
  { lesson: 9, dialogue: 2, speaker: 'SECRETARIA', spanish: 'Muchas gracias por llamar. Adiós.', english: 'Thank you very much for calling. Goodbye.' },

  // Reading — Rob, Rosa and Lola
  { lesson: 9, dialogue: 3, speaker: 'ROB',  spanish: '¿Qué está haciendo Lola?', english: 'What is Lola doing?' },
  { lesson: 9, dialogue: 3, speaker: 'ROSA', spanish: 'Está escribiendo algo en el ordenador. ¿Pues?', english: 'She\'s writing something on the computer. Why?' },
  { lesson: 9, dialogue: 3, speaker: 'ROB',  spanish: 'No, es que necesito ir al centro y tengo el coche averiado. Y Luis, ¿está en casa?', english: 'It\'s just that I need to go to the centre and my car has broken down. Is Luis at home?' },
  { lesson: 9, dialogue: 3, speaker: 'ROSA', spanish: 'Sí, pero creo que está estudiando, tiene los exámenes mañana.', english: 'Yes, but I think he\'s studying, he has exams tomorrow.' },
  { lesson: 9, dialogue: 3, speaker: 'ROB',  spanish: '¡Ah! entonces no le molesto. Y Juanjo, ¿no está por aquí?', english: 'Ah! Then I won\'t disturb him. And Juanjo, is he around?' },
  { lesson: 9, dialogue: 3, speaker: 'ROSA', spanish: 'No, lo siento, está trabajando.', english: 'No, I\'m sorry, he\'s working.' },
  { lesson: 9, dialogue: 3, speaker: 'ROB',  spanish: 'Bueno, pues... ah, bueno pues me voy...', english: 'Well then... er, OK, I\'ll be off...' },
  { lesson: 9, dialogue: 3, speaker: 'ROSA', spanish: '¿A qué hora tienes que estar allí?', english: 'What time do you need to be there?' },
  { lesson: 9, dialogue: 3, speaker: 'ROB',  spanish: 'Antes de las doce.', english: 'Before twelve.' },
  { lesson: 9, dialogue: 3, speaker: 'ROSA', spanish: 'Ya te llevo yo. Pero tienes que esperar un poco, estoy terminando de preparar una lección para esta tarde.', english: 'I\'ll take you. But you have to wait a bit, I\'m finishing preparing a lesson for this afternoon.' },
  { lesson: 9, dialogue: 3, speaker: 'ROB',  spanish: 'Muchísimas gracias, no sabes lo que te lo agradezco. Ya sé que estás muy ocupada. Pero ¿estás segura? No quiero molestarte.', english: 'Thank you so much, you don\'t know how grateful I am. I know you\'re very busy. But are you sure? I don\'t want to disturb you.' },
  { lesson: 9, dialogue: 3, speaker: 'ROSA', spanish: 'Sí, hombre. Si no, no me ofrecería a llevarte.', english: 'Of course. If not, I wouldn\'t offer to take you.' },

  // ───────────────────────────────────────────────
  // LESSON 10 — At the Office
  // ───────────────────────────────────────────────

  // Dialogue 1
  { lesson: 10, dialogue: 1, speaker: 'JEFE',  spanish: 'A ver, dígame lo que ha hecho esta mañana.', english: 'Let\'s see, tell me what you\'ve done this morning.' },
  { lesson: 10, dialogue: 1, speaker: 'CHRIS', spanish: 'Pues he escrito tres cartas, he mandado por lo menos 30 e-mails, he llamado por teléfono a varios clientes y he hablado con la señora Sánchez sobre las citas de mañana.', english: 'Well, I\'ve written three letters, I\'ve sent at least 30 emails, I\'ve telephoned several clients and I\'ve spoken to Mrs Sánchez about tomorrow\'s appointments.' },
  { lesson: 10, dialogue: 1, speaker: 'JEFE',  spanish: '¿Y todavía no ha terminado el informe de ayer?', english: 'And you still haven\'t finished yesterday\'s report?' },
  { lesson: 10, dialogue: 1, speaker: 'CHRIS', spanish: 'No, es que también he tenido que ir a la librería a comprar un libro para su esposa.', english: 'No, because I also had to go to the bookshop to buy a book for your wife.' },
  { lesson: 10, dialogue: 1, speaker: 'JEFE',  spanish: '¡Ah bueno! ¿Y qué libro le ha comprado?', english: 'Oh really! And what book did you buy her?' },
  { lesson: 10, dialogue: 1, speaker: 'CHRIS', spanish: 'El que me dijo usted, La Comida Mexicana.', english: 'The one you told me, La Comida Mexicana.' },
  { lesson: 10, dialogue: 1, speaker: 'JEFE',  spanish: 'Bueno, eso es todo de momento. Ya sabe que aquí hay que trabajar duro.', english: 'Right, that\'s all for now. You know we have to work hard here.' },
  { lesson: 10, dialogue: 1, speaker: 'CHRIS', spanish: 'Sí señor.', english: 'Yes sir.' },

  // Dialogue 2 — Arriving late
  { lesson: 10, dialogue: 2, speaker: 'JULIA',  spanish: 'Hola, perdonad por llegar tarde pero es que mi hija se ha puesto enferma esta tarde.', english: 'Hello, sorry I\'m late but my daughter has fallen ill this afternoon.' },
  { lesson: 10, dialogue: 2, speaker: 'LORENA', spanish: 'Tranquila, mujer. ¿Qué tal se encuentra ahora?', english: 'Don\'t worry. How is she now?' },
  { lesson: 10, dialogue: 2, speaker: 'JULIA',  spanish: 'Un poco mejor. El médico le ha dado un jarabe para la fiebre y parece que le ha bajado un poco.', english: 'A bit better. The doctor has given her some syrup for the fever and it seems it\'s come down a little.' },
  { lesson: 10, dialogue: 2, speaker: 'LUISA',  spanish: '¿Quién se ha quedado con ella, tu marido?', english: 'Who\'s stayed with her, your husband?' },
  { lesson: 10, dialogue: 2, speaker: 'JULIA',  spanish: 'Sí, no le toca trabajar esta noche.', english: 'Yes, it\'s not his turn to work tonight.' },
  { lesson: 10, dialogue: 2, speaker: 'LUISA',  spanish: 'Bueno, pues ahora a comer.', english: 'Right then, let\'s eat now.' },
  { lesson: 10, dialogue: 2, speaker: 'JULIA',  spanish: 'Sí, tengo una hambre que no veo, no he comido nada desde la mañana.', english: 'Yes, I\'m absolutely starving, I haven\'t eaten anything since this morning.' },

  // Reading — Natalia and Daniel
  { lesson: 10, dialogue: 3, speaker: 'NATALIA', spanish: 'Perdona por llegar tarde.', english: 'Sorry for being late.' },
  { lesson: 10, dialogue: 3, speaker: 'DANIEL',  spanish: '¿Dónde has estado?', english: 'Where have you been?' },
  { lesson: 10, dialogue: 3, speaker: 'NATALIA', spanish: 'Cuando he salido del trabajo he ido a ver la película de Saura.', english: 'When I left work I went to see the Saura film.' },
  { lesson: 10, dialogue: 3, speaker: 'DANIEL',  spanish: '¿Por qué no me has llamado cuando has salido? Podíamos haber ido a tomar una copa juntos. Hace tiempo que no hemos salido.', english: 'Why didn\'t you call me when you left? We could have gone for a drink together. We haven\'t been out for a while.' },
  { lesson: 10, dialogue: 3, speaker: 'NATALIA', spanish: 'Es que cuando ha terminado la película me he encontrado con Pepa.', english: 'It\'s just that when the film ended I bumped into Pepa.' },
  { lesson: 10, dialogue: 3, speaker: 'DANIEL',  spanish: '¡Ah! Así que ella es más importante que yo, ¿no?', english: 'Ah! So she\'s more important than me, is she?' },
  { lesson: 10, dialogue: 3, speaker: 'NATALIA', spanish: 'No hombre, pero es que ha roto con su novio y está bastante mal.', english: 'No, come on, but she\'s split up with her boyfriend and she\'s quite upset.' },
  { lesson: 10, dialogue: 3, speaker: 'DANIEL',  spanish: 'Ah lo siento, no lo sabía. ¿Cuándo han roto?', english: 'Oh, I\'m sorry, I didn\'t know. When did they break up?' },
  { lesson: 10, dialogue: 3, speaker: 'NATALIA', spanish: 'Esta semana. Creo que él se ha ido a vivir con su hermana en Sevilla. Se ha llevado todo, hasta el coche.', english: 'This week. I think he\'s gone to live with his sister in Seville. He took everything, even the car.' },
  { lesson: 10, dialogue: 3, speaker: 'DANIEL',  spanish: '¡Pobre Pepa!', english: 'Poor Pepa!' },

  // ───────────────────────────────────────────────
  // LESSON 11 — Family Problems
  // ───────────────────────────────────────────────

  // Dialogue 1 — Asking for news
  { lesson: 11, dialogue: 1, speaker: 'PETER',  spanish: '¡Hola Merche! ¡Qué sorpresa verte por aquí! ¿Cómo te va todo?', english: 'Hi Merche! What a surprise to see you here! How\'s everything going?' },
  { lesson: 11, dialogue: 1, speaker: 'MERCHE', spanish: 'Hola Peter, muy bien y ¿a ti?', english: 'Hi Peter, very well, and you?' },
  { lesson: 11, dialogue: 1, speaker: 'PETER',  spanish: 'Pues regular. Estoy muy preocupado por mi hermano. Por cierto, no lo has visto, ¿no?', english: 'So-so. I\'m very worried about my brother. By the way, you haven\'t seen him, have you?' },
  { lesson: 11, dialogue: 1, speaker: 'MERCHE', spanish: 'Pues no, la última vez creo que fue en la fiesta de cumpleaños de Roberto. Vino con Manola. Mira está ahí, ¿por qué no le preguntas a ella? Igual sabe algo.', english: 'No, the last time was I think at Roberto\'s birthday party. He came with Manola. Look, she\'s over there, why don\'t you ask her? Maybe she knows something.' },
  { lesson: 11, dialogue: 1, speaker: 'PETER',  spanish: 'Sí, voy ahora mismo. Hasta luego.', english: 'Yes, I\'ll go right now. Bye.' },
  { lesson: 11, dialogue: 1, speaker: 'PETER',  spanish: 'Perdona Manola, ¿has visto a Simon últimamente?', english: 'Excuse me Manola, have you seen Simon recently?' },
  { lesson: 11, dialogue: 1, speaker: 'MANOLA', spanish: 'Hablé con él ayer, ¿pues?', english: 'I spoke to him yesterday, why?' },
  { lesson: 11, dialogue: 1, speaker: 'PETER',  spanish: 'Es que no sé nada de él desde hace mucho tiempo. Discutimos un día y desde entonces no le he vuelto a ver. ¿Qué tal está?', english: 'It\'s just that I haven\'t heard from him for a long time. We had an argument one day and since then I haven\'t seen him. How is he?' },
  { lesson: 11, dialogue: 1, speaker: 'MANOLA', spanish: 'Bien, creo, no me dijo nada especial.', english: 'Fine, I think, he didn\'t tell me anything particular.' },
  { lesson: 11, dialogue: 1, speaker: 'PETER',  spanish: 'Si te llama otra vez por favor dile que mis padres y yo estamos muy preocupados.', english: 'If he calls you again please tell him that my parents and I are very worried.' },
  { lesson: 11, dialogue: 1, speaker: 'MANOLA', spanish: 'Vale, ya se lo digo, pero tranquilo, hombre, no te preocupes.', english: 'OK, I\'ll tell him, but relax, don\'t worry.' },

  // Dialogue 2 — Passing on a message
  { lesson: 11, dialogue: 2, speaker: 'MANOLA', spanish: '¿Sí?', english: 'Yes?' },
  { lesson: 11, dialogue: 2, speaker: 'SIMON',  spanish: 'Hola Manola, soy Simon.', english: 'Hi Manola, it\'s Simon.' },
  { lesson: 11, dialogue: 2, speaker: 'MANOLA', spanish: '¡Simon, por fin! ¿Cómo estás?', english: 'Simon, at last! How are you?' },
  { lesson: 11, dialogue: 2, speaker: 'SIMON',  spanish: 'Bien, ¿pero por qué dices \'por fin\'? Quedamos en vernos hoy, ¿no?', english: 'Fine, but why do you say \'at last\'? We agreed to see each other today, didn\'t we?' },
  { lesson: 11, dialogue: 2, speaker: 'MANOLA', spanish: 'Sí, ya sé, pero es que te he llamado un montón de veces y siempre comunica.', english: 'Yes, I know, but I\'ve called you loads of times and it\'s always engaged.' },
  { lesson: 11, dialogue: 2, speaker: 'SIMON',  spanish: 'Es que se me estropeó el teléfono y acabo de comprar otro. Pero, ¿qué querías?', english: 'My phone broke and I\'ve just bought another one. But what did you want?' },
  { lesson: 11, dialogue: 2, speaker: 'MANOLA', spanish: 'Es que vi a tu hermano el otro día y me dijo que discutisteis...', english: 'It\'s just that I saw your brother the other day and he told me you had an argument...' },
  { lesson: 11, dialogue: 2, speaker: 'SIMON',  spanish: 'Sí, es verdad, ¿te dijo algo más?', english: 'Yes, it\'s true, did he tell you anything else?' },
  { lesson: 11, dialogue: 2, speaker: 'MANOLA', spanish: 'No pero ¿vas a llamarle?', english: 'No, but are you going to call him?' },
  { lesson: 11, dialogue: 2, speaker: 'SIMON',  spanish: 'No sé. No me apetece mucho hablar con él.', english: 'I don\'t know. I don\'t really feel like talking to him.' },
  { lesson: 11, dialogue: 2, speaker: 'MANOLA', spanish: 'Pero hombre, es tu hermano. No te cuesta nada llamarle.', english: 'But come on, he\'s your brother. It doesn\'t cost you anything to call him.' },
  { lesson: 11, dialogue: 2, speaker: 'SIMON',  spanish: 'Bueno, bueno, igual le llamo luego.', english: 'All right, all right, maybe I\'ll call him later.' },

  // ───────────────────────────────────────────────
  // LESSON 12 — Writing Home
  // ───────────────────────────────────────────────

  // Email exercise dialogue — Antonio and Susana
  { lesson: 12, dialogue: 1, speaker: 'ANTONIO', spanish: 'Hola Susana, soy Antonio.', english: 'Hi Susana, it\'s Antonio.' },
  { lesson: 12, dialogue: 1, speaker: 'SUSANA',  spanish: 'Hola, Antonio, ¿qué tal?', english: 'Hi Antonio, how are you?' },
  { lesson: 12, dialogue: 1, speaker: 'ANTONIO', spanish: 'Muy bien, ¿y tú?', english: 'Very well, and you?' },
  { lesson: 12, dialogue: 1, speaker: 'SUSANA',  spanish: 'Muy bien.', english: 'Very well.' },
  { lesson: 12, dialogue: 1, speaker: 'ANTONIO', spanish: '¿Dónde estuviste ayer por la noche?', english: 'Where were you last night?' },
  { lesson: 12, dialogue: 1, speaker: 'SUSANA',  spanish: 'Estuve toda la noche en casa.', english: 'I was at home all night.' },
  { lesson: 12, dialogue: 1, speaker: 'ANTONIO', spanish: '¿Estuviste sola?', english: 'Were you alone?' },
  { lesson: 12, dialogue: 1, speaker: 'SUSANA',  spanish: 'No, vino Luisa.', english: 'No, Luisa came round.' },
  { lesson: 12, dialogue: 1, speaker: 'ANTONIO', spanish: '¿Qué hicisteis?', english: 'What did you do?' },
  { lesson: 12, dialogue: 1, speaker: 'SUSANA',  spanish: 'Vimos una película en la tele y después charlamos un rato.', english: 'We watched a film on TV and then chatted for a while.' },
  { lesson: 12, dialogue: 1, speaker: 'ANTONIO', spanish: '¿A qué hora se fue?', english: 'What time did she leave?' },
  { lesson: 12, dialogue: 1, speaker: 'SUSANA',  spanish: 'A las doce y media, o algo así.', english: 'At half past twelve, or thereabouts.' },
  { lesson: 12, dialogue: 1, speaker: 'ANTONIO', spanish: '¿Comemos juntos?', english: 'Shall we have lunch together?' },
  { lesson: 12, dialogue: 1, speaker: 'SUSANA',  spanish: 'Vale, ¿a qué hora quedamos?', english: 'OK, what time shall we meet?' },
  { lesson: 12, dialogue: 1, speaker: 'ANTONIO', spanish: '¿A la una y media en el bar enfrente de tu casa?', english: 'Half past one at the bar opposite your house?' },
  { lesson: 12, dialogue: 1, speaker: 'SUSANA',  spanish: 'De acuerdo, hasta luego.', english: 'OK, see you later.' },

  // ───────────────────────────────────────────────
  // LESSON 13 — A Robbery / Emergencies
  // ───────────────────────────────────────────────

  // Dialogue 1 — At the police station
  { lesson: 13, dialogue: 1, speaker: 'POLICÍA', spanish: 'Buenas tardes, señorita. ¿En qué puedo ayudarle?', english: 'Good afternoon, miss. How can I help you?' },
  { lesson: 13, dialogue: 1, speaker: 'LIZ',     spanish: 'Me acaban de robar todo.', english: 'I\'ve just been robbed of everything.' },
  { lesson: 13, dialogue: 1, speaker: 'POLICÍA', spanish: '¿Dónde ha sido?', english: 'Where did it happen?' },
  { lesson: 13, dialogue: 1, speaker: 'LIZ',     spanish: 'Muy cerca de aquí, en una de las calles del Barrio Gótico.', english: 'Very near here, in one of the streets of the Gothic Quarter.' },
  { lesson: 13, dialogue: 1, speaker: 'POLICÍA', spanish: '¿Vio quién le robó?', english: 'Did you see who robbed you?' },
  { lesson: 13, dialogue: 1, speaker: 'LIZ',     spanish: 'Sí mire. Iba andando cuando dos hombres se acercaron a pedirme fuego. Iba a sacar el mechero cuando uno de ellos sacó una navaja.', english: 'Yes, look. I was walking when two men came up to ask me for a light. I was about to get out my lighter when one of them pulled out a knife.' },
  { lesson: 13, dialogue: 1, speaker: 'LIZ',     spanish: 'Se llevaron todo, el dinero, las tarjetas de crédito, la cámara y hasta la chaqueta de cuero.', english: 'They took everything, the money, the credit cards, the camera and even my leather jacket.' },
  { lesson: 13, dialogue: 1, speaker: 'POLICÍA', spanish: '¿Cómo eran?', english: 'What did they look like?' },
  { lesson: 13, dialogue: 1, speaker: 'LIZ',     spanish: 'El de la navaja era bajo pero bastante fuerte. Llevaba el pelo muy corto. Llevaba puesta una chaqueta oscura y pantalones vaqueros.', english: 'The one with the knife was short but quite strong. He had very short hair. He was wearing a dark jacket and jeans.' },
  { lesson: 13, dialogue: 1, speaker: 'LIZ',     spanish: 'El otro era rubio, alto, y delgado. Llevaba una chaqueta de cuero negra y pantalones vaqueros del mismo color.', english: 'The other one was fair-haired, tall and thin. He was wearing a black leather jacket and jeans of the same colour.' },
  { lesson: 13, dialogue: 1, speaker: 'POLICÍA', spanish: 'Bien, mire, de momento tiene que rellenar esta hoja. Si deja su dirección y un número de teléfono nos pondremos en contacto con usted.', english: 'Right, look, for now you need to fill in this form. If you leave your address and a phone number we\'ll get in touch with you.' },

  // Dialogue 2 — An accident
  { lesson: 13, dialogue: 2, speaker: 'SUSAN',    spanish: 'Pero mujer, ¿qué te ha pasado?', english: 'Goodness, what happened to you?' },
  { lesson: 13, dialogue: 2, speaker: 'MERCEDES', spanish: 'Nada, que me he roto el brazo.', english: 'I\'ve broken my arm, that\'s all.' },
  { lesson: 13, dialogue: 2, speaker: 'SUSAN',    spanish: '¿Cómo ha sido?', english: 'How did it happen?' },
  { lesson: 13, dialogue: 2, speaker: 'MERCEDES', spanish: 'Es que tuve un accidente de coche hace un mes.', english: 'I had a car accident a month ago.' },
  { lesson: 13, dialogue: 2, speaker: 'SUSAN',    spanish: '¿Ah sí? Pues no sabía nada. ¿Con quién ibas?', english: 'Really? I didn\'t know anything about it. Who were you with?' },
  { lesson: 13, dialogue: 2, speaker: 'MERCEDES', spanish: 'Iba con Eder. Volvíamos de las fiestas de Bilbao, íbamos muy despacio porque había niebla, cuando de repente en una curva un coche se nos vino encima. Del resto no me acuerdo.', english: 'I was with Eder. We were coming back from the Bilbao festivities, we were going very slowly because there was fog, when suddenly on a bend a car came straight at us. I don\'t remember the rest.' },
  { lesson: 13, dialogue: 2, speaker: 'SUSAN',    spanish: 'Y Eder, ¿qué tal está?', english: 'And how is Eder?' },
  { lesson: 13, dialogue: 2, speaker: 'MERCEDES', spanish: 'Pues estuvo muy grave pero ahora ya está fuera de peligro aunque sigue en el hospital.', english: 'He was very serious but now he\'s out of danger, though he\'s still in hospital.' },
  { lesson: 13, dialogue: 2, speaker: 'SUSAN',    spanish: '¡Qué horror! Oye, ¿se puede ir a verle?', english: 'How awful! Listen, can we go and see him?' },
  { lesson: 13, dialogue: 2, speaker: 'MERCEDES', spanish: 'Sí claro, además le haría mucha ilusión verte. ¡No sabes lo aburrido que es estar en un hospital!', english: 'Yes of course, and it would make him very happy to see you. You don\'t know how boring it is to be in hospital!' },
  { lesson: 13, dialogue: 2, speaker: 'SUSAN',    spanish: 'Vale, ¿en qué hospital está?', english: 'OK, which hospital is he in?' },
  { lesson: 13, dialogue: 2, speaker: 'MERCEDES', spanish: 'En Cruces, pero no puedes ir sin tarjeta de visita. Antes de ir llama a su familia.', english: 'In Cruces, but you can\'t go without a visitor\'s pass. Before you go, call his family.' },
  { lesson: 13, dialogue: 2, speaker: 'SUSAN',    spanish: 'De acuerdo. Bueno, me tengo que ir ahora. A ver si te pones bien pronto.', english: 'All right. Well, I have to go now. I hope you get better soon.' },
  { lesson: 13, dialogue: 2, speaker: 'MERCEDES', spanish: 'Gracias. Adiós.', english: 'Thank you. Goodbye.' },

  // ───────────────────────────────────────────────
  // LESSON 14 — Hopes for the Future
  // ───────────────────────────────────────────────

  // Opening — Fernando and Carmina (play extract)
  { lesson: 14, dialogue: 1, speaker: 'FERNANDO', spanish: 'Sí, acabar con todo esto. ¡Ayúdame tú! Escucha: voy a estudiar mucho, ¿sabes?', english: 'Yes, put an end to all this. Help me! Listen: I\'m going to study a lot, you know?' },
  { lesson: 14, dialogue: 1, speaker: 'FERNANDO', spanish: 'Primero me haré delineante. ¡Eso es fácil! En un año...', english: 'First I\'ll become a draughtsman. That\'s easy! In a year...' },
  { lesson: 14, dialogue: 1, speaker: 'FERNANDO', spanish: 'Como para entonces ya ganaré bastante, estudiaré para aparejador solicitado por todos los arquitectos. Ganaré mucho dinero.', english: 'Since by then I\'ll be earning quite well, I\'ll study to be a quantity surveyor sought after by all the architects. I\'ll earn a lot of money.' },
  { lesson: 14, dialogue: 1, speaker: 'FERNANDO', spanish: 'Por entonces tú serás ya mi mujercita, y viviremos en otro barrio, en un pisito limpio y tranquilo.', english: 'By then you\'ll already be my little wife, and we\'ll live in another neighbourhood, in a small clean and peaceful flat.' },
  { lesson: 14, dialogue: 1, speaker: 'FERNANDO', spanish: 'Yo seguiré estudiando. ¿Quién sabe? Puede que para entonces me haga ingeniero.', english: 'I\'ll carry on studying. Who knows? Maybe by then I\'ll have become an engineer.' },
  { lesson: 14, dialogue: 1, speaker: 'FERNANDO', spanish: 'Y como una cosa no es incompatible con la otra, publicaré un libro de poesías, un libro que tendrá mucho éxito...', english: 'And since one thing is not incompatible with the other, I\'ll publish a book of poems, a book that will be very successful...' },
  { lesson: 14, dialogue: 1, speaker: 'CARMINA', spanish: '¡Qué felices seremos!', english: 'How happy we will be!' },

  // Dialogue 2 — Mr Hampson and Sr. López
  { lesson: 14, dialogue: 2, speaker: 'MR HAMPSON', spanish: '¿Cuándo podrá mandar el último pedido?', english: 'When will you be able to send the last order?' },
  { lesson: 14, dialogue: 2, speaker: 'SR. LOPEZ',  spanish: 'Estará listo la semana que viene.', english: 'It will be ready next week.' },
  { lesson: 14, dialogue: 2, speaker: 'MR HAMPSON', spanish: '¿Tardará mucho en llegar a Nueva York?', english: 'Will it take long to get to New York?' },
  { lesson: 14, dialogue: 2, speaker: 'SR. LOPEZ',  spanish: 'Mire, depende de cómo se mande; si lo mandamos por correo aéreo estará en su oficina en menos de cinco días, en cambio si lo mandamos por barco tardará unas cinco semanas.', english: 'Look, it depends on how we send it; if we send it by airmail it will be in your office in less than five days, whereas if we send it by sea it will take about five weeks.' },
  { lesson: 14, dialogue: 2, speaker: 'SR. LOPEZ',  spanish: '¿Le corre prisa?', english: 'Is it urgent?' },
  { lesson: 14, dialogue: 2, speaker: 'MR HAMPSON', spanish: 'Pues sí, bastante.', english: 'Well yes, quite urgent.' },
  { lesson: 14, dialogue: 2, speaker: 'SR. LOPEZ',  spanish: 'Entonces sería mejor mandarlo por avión, ¿no?', english: 'Then it would be better to send it by plane, wouldn\'t it?' },
  { lesson: 14, dialogue: 2, speaker: 'MR HAMPSON', spanish: '¿Costará mucho más?', english: 'Will it cost a lot more?' },
  { lesson: 14, dialogue: 2, speaker: 'SR. LOPEZ',  spanish: 'Algo así como el uno por ciento del coste total.', english: 'Something like one per cent of the total cost.' },

  // Reading — Fernando's son and Carmina's daughter
  { lesson: 14, dialogue: 3, speaker: 'FERNANDO HIJO',  spanish: 'Sí, Carmina. Aquí sólo hay brutalidad e incomprensión para nosotros.', english: 'Yes, Carmina. Here there\'s nothing for us but brutality and incomprehension.' },
  { lesson: 14, dialogue: 3, speaker: 'FERNANDO HIJO',  spanish: 'Escúchame. Si tu cariño no me falta, emprenderé muchas cosas. Primero me haré aparejador. ¡No es difícil!', english: 'Listen to me. If your love doesn\'t fail me, I\'ll undertake many things. First I\'ll become a quantity surveyor. It\'s not hard!' },
  { lesson: 14, dialogue: 3, speaker: 'FERNANDO HIJO',  spanish: 'En unos años me haré un buen aparejador. Ganaré mucho dinero y me solicitarán todas las empresas constructoras.', english: 'In a few years I\'ll become a good quantity surveyor. I\'ll earn a lot of money and all the construction companies will want me.' },
  { lesson: 14, dialogue: 3, speaker: 'FERNANDO HIJO',  spanish: 'Para entonces ya estaremos casados. Tendremos nuestro hogar, alegre y limpio..., lejos de aquí.', english: 'By then we\'ll already be married. We\'ll have our home, cheerful and clean, far from here.' },
  { lesson: 14, dialogue: 3, speaker: 'FERNANDO HIJO',  spanish: 'Pero no dejaré de estudiar por eso. ¡No, no, Carmina! Entonces me haré ingeniero. Seré el mejor ingeniero del país y tú serás mi adorada mujercita...', english: 'But I won\'t stop studying because of that. No, no, Carmina! Then I\'ll become an engineer. I\'ll be the best engineer in the country and you\'ll be my adored little wife...' },
  { lesson: 14, dialogue: 3, speaker: 'CARMINA HIJA',   spanish: '¡Fernando! ¡Qué felicidad!... ¡Qué felicidad!', english: 'Fernando! What happiness!... What happiness!' },

  // ───────────────────────────────────────────────
  // LESSON 15 — Invitations & Socializing
  // ───────────────────────────────────────────────

  // Dialogue 1 — Confirming an invitation
  { lesson: 15, dialogue: 1, speaker: 'ASUN', spanish: '¿Sí, dígame?', english: 'Hello?' },
  { lesson: 15, dialogue: 1, speaker: 'LIZ',  spanish: 'Asun, soy Liz. Mira, no me acuerdo a qué hora quieres que estemos en tu casa.', english: 'Asun, it\'s Liz. Look, I can\'t remember what time you want us to be at your house.' },
  { lesson: 15, dialogue: 1, speaker: 'ASUN', spanish: 'Hacia las nueve. Lewis y Mark vienen contigo, ¿no?', english: 'Around nine. Lewis and Mark are coming with you, aren\'t they?' },
  { lesson: 15, dialogue: 1, speaker: 'LIZ',  spanish: 'Lewis viene seguro pero no creo que venga Mark, no se encuentra muy bien.', english: 'Lewis is definitely coming but I don\'t think Mark will come, he\'s not feeling very well.' },
  { lesson: 15, dialogue: 1, speaker: 'ASUN', spanish: 'Ah, cuánto lo siento. Espero que se ponga bueno para mañana, porque se va mañana, ¿no?', english: 'Oh, I\'m so sorry. I hope he gets better for tomorrow, because he\'s leaving tomorrow, isn\'t he?' },
  { lesson: 15, dialogue: 1, speaker: 'LIZ',  spanish: 'Sí, por cierto, si quieres venir mañana a casa a despedirte...', english: 'Yes, by the way, if you want to come to our place tomorrow to say goodbye...' },
  { lesson: 15, dialogue: 1, speaker: 'ASUN', spanish: 'Muy buena idea. ¿A qué hora se va?', english: 'Very good idea. What time is he leaving?' },
  { lesson: 15, dialogue: 1, speaker: 'LIZ',  spanish: 'Creo que a las cuatro de la tarde.', english: 'I think at four in the afternoon.' },
  { lesson: 15, dialogue: 1, speaker: 'ASUN', spanish: 'Bien, luego hablamos. Hasta luego.', english: 'Good, we\'ll talk later. Goodbye.' },
  { lesson: 15, dialogue: 1, speaker: 'LIZ',  spanish: 'Hasta luego.', english: 'Goodbye.' },

  // Dialogue 2 — Asking a favour
  { lesson: 15, dialogue: 2, speaker: 'SEÑORA',   spanish: 'En cuanto llegues quiero que prepares la merienda para Luisito y su amigo Jaime.', english: 'As soon as you arrive I want you to prepare the afternoon snack for Luisito and his friend Jaime.' },
  { lesson: 15, dialogue: 2, speaker: 'SEÑORA',   spanish: 'Después de merendar no quiero que vean la tele, diles que hagan los deberes primero.', english: 'After their snack I don\'t want them watching TV, tell them to do their homework first.' },
  { lesson: 15, dialogue: 2, speaker: 'MARGARET', spanish: 'Sí señora.', english: 'Yes, ma\'am.' },
  { lesson: 15, dialogue: 2, speaker: 'SEÑORA',   spanish: 'Cuando terminen los deberes pueden jugar un rato en la habitación pero no les dejes jugar en el salón.', english: 'When they finish their homework they can play for a while in the bedroom but don\'t let them play in the living room.' },
  { lesson: 15, dialogue: 2, speaker: 'MARGARET', spanish: '¿Quiere que les prepare yo la cena?', english: 'Do you want me to prepare their dinner?' },
  { lesson: 15, dialogue: 2, speaker: 'SEÑORA',   spanish: 'Si no te importa, por favor. Hay unos filetes de pescado en la nevera pero no creo que haya ninguna verdura fresca, así que saca algo del congelador.', english: 'If you don\'t mind, please. There are some fish fillets in the fridge but I don\'t think there are any fresh vegetables, so get something from the freezer.' },
  { lesson: 15, dialogue: 2, speaker: 'MARGARET', spanish: 'Sí señora, no se preocupe.', english: 'Yes ma\'am, don\'t worry.' },
  { lesson: 15, dialogue: 2, speaker: 'SEÑORA',   spanish: '¡Ah! cuando se marche Jaime mándale a Luisito que se acueste enseguida y que no me espere que voy a llegar tarde.', english: 'Ah! When Jaime leaves, tell Luisito to go to bed straight away and not to wait up for me as I\'m going to be late.' },
  { lesson: 15, dialogue: 2, speaker: 'MARGARET', spanish: 'Sí señora.', english: 'Yes ma\'am.' },
];
