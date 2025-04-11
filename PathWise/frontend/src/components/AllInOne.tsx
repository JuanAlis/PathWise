import { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { useNavigate } from "react-router-dom";
import { inscribirseActividad, fetchActivities } from "../redux/activitySlice";
import { hacerPregunta } from "../redux/activitySlice";
import { responderPregunta, editarPregunta, editarRespuesta, eliminarPregunta, eliminarRespuesta, deleteActivity } from "../redux/activitySlice";
import { desinscribirseActividad } from "../redux/activitySlice";

/**
 * Displays all activities with updated card styling based on the reference image.
 */
const AllInOne = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { activities, loading, error } = useSelector(
		(state: RootState) => state.activities
	);
	const { user, token } = useSelector((state: RootState) => state.auth);

	useEffect(() => {
		dispatch(fetchActivities());
	}, [dispatch]);

	/**
	 * Handles student enrollment in an activity.
	 */
	const handleInscribirse = useCallback(
		async (id: string) => {
			if (!token || !user)
				return alert("Debes iniciar sesión para inscribirte.");
			if (user.tipo !== "alumno")
				return alert("Solo los alumnos pueden inscribirse.");

			try {
				await dispatch(inscribirseActividad({ id, token })).unwrap();
				dispatch(fetchActivities());
				alert("✅ Te has inscrito correctamente");
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : String(err);
				alert(`❌ Error al inscribirse: ${message}`);
			}
		},
		[dispatch, token, user]
	);


	const [preguntasTexto, setPreguntasTexto] = useState<{ [id: string]: string }>({});


	const handlePregunta = async (id: string) => {
		if (!token || !user) return alert("Debes iniciar sesión.");
		if (user.tipo !== "alumno") return;

		const contenido = preguntasTexto[id];
		if (!contenido) return;

		try {
			await dispatch(hacerPregunta({ id, contenido, token })).unwrap();
			dispatch(fetchActivities());
			setPreguntasTexto((prev) => ({ ...prev, [id]: "" }));
			alert("✅ Pregunta enviada correctamente");
		} catch (error: unknown) {
			alert("❌ Error al enviar pregunta: " + error);
		}
	};

	const [respuestasTexto, setRespuestasTexto] = useState<{ [preguntaId: string]: string }>({});

	const handleResponder = async (activityId: string, preguntaId: string) => {
		const respuesta = respuestasTexto[preguntaId];
		if (!respuesta) return;

		try {
			await dispatch(responderPregunta({ activityId, preguntaId, respuesta, token: token! })).unwrap();
			dispatch(fetchActivities());
			setRespuestasTexto((prev) => ({ ...prev, [preguntaId]: "" }));
			alert("✅ Respuesta enviada correctamente");
		} catch (error: unknown) {
			alert("❌ Error al responder: " + error);
		}
	};


	const [editandoPreguntaId, setEditandoPreguntaId] = useState<string | null>(null);
	const [nuevoContenidoPregunta, setNuevoContenidoPregunta] = useState<{ [id: string]: string }>({});

	const handleGuardarEdicion = async (activityId: string, preguntaId: string) => {
		const contenido = nuevoContenidoPregunta[preguntaId];
		if (!contenido) return;

		try {
			await dispatch(editarPregunta({ activityId, preguntaId, contenido, token: token! })).unwrap();
			dispatch(fetchActivities());
			setEditandoPreguntaId(null);
			setNuevoContenidoPregunta((prev) => ({ ...prev, [preguntaId]: "" }));
			alert("✅ Pregunta editada");
		} catch (error: unknown) {
			alert("❌ Error al editar: " + error);
		}
	};

	const handleEliminarPregunta = async (activityId: string, preguntaId: string) => {
		if (!window.confirm("¿Seguro que quieres eliminar la pregunta?")) return;
		try {
			await dispatch(eliminarPregunta({ activityId, preguntaId, token: token! })).unwrap();
			dispatch(fetchActivities());
			alert("✅ Pregunta eliminada");
		} catch (error: unknown) {
			alert("❌ Error al eliminar pregunta: " + error);
		}
	};

	const handleDesinscribirse = async (id: string) => {
		try {
			await dispatch(desinscribirseActividad({ id, token: token! })).unwrap();
			dispatch(fetchActivities());
			alert("Te has desinscrito correctamente");
		} catch (error: any) {
			alert("Error al desinscribirse");
		}
	};

	const handleEliminarActividad = async (id: string) => {
		if (!window.confirm("¿Seguro que quieres eliminar esta actividad?")) return;
		try {
			await dispatch(deleteActivity({ id, token: token! })).unwrap();
			dispatch(fetchActivities());
			alert("Actividad eliminada correctamente");
		} catch (error: any) {
			alert("Error al eliminar la actividad");
		}
	};

	const handleEliminarRespuesta = async (activityId: string, preguntaId: string) => {
		if (!window.confirm("¿Eliminar esta respuesta?")) return;

		try {
			await dispatch(eliminarRespuesta({ activityId, preguntaId, token: token! })).unwrap();
			dispatch(fetchActivities());
			alert("✅ Respuesta eliminada correctamente");
		} catch (error: any) {
			alert("❌ Error al eliminar la respuesta");
		}
	};

	const [editandoRespuestaId, setEditandoRespuestaId] = useState<string | null>(null);
	const [nuevoContenidoRespuesta, setNuevoContenidoRespuesta] = useState<{ [id: string]: string }>({});

	const handleGuardarEdicionRespuesta = async (activityId: string, preguntaId: string) => {
		const respuesta = nuevoContenidoRespuesta[preguntaId];
		if (!respuesta) return;

		try {
			await dispatch(editarRespuesta({ activityId, preguntaId, respuesta, token: token! })).unwrap();
			dispatch(fetchActivities());
			setEditandoRespuestaId(null);
			setNuevoContenidoRespuesta((prev) => ({ ...prev, [preguntaId]: "" }));
			alert("✅ Respuesta editada correctamente");
		} catch (error: any) {
			alert("❌ Error al editar la respuesta");
		}
	};



	return (
		<div className="mx-auto px-4 mt-8 mb-12 max-w-7xl">
			<div className="flex justify-between items-center mb-8">
				<h2 className="text-3xl font-bold text-gray-900">
					Actividades Disponibles
				</h2>
				{user?.tipo === "profesor" && (
					<button
						className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-md shadow transition duration-150 ease-in-out"
						onClick={() => navigate("/activities/create")}
					>
						Crear Actividad
					</button>
				)}
			</div>
			{loading && (
				<p className="text-center text-gray-500 py-10">
					Cargando actividades...
				</p>
			)}
			{error && (
				<p className="text-center text-red-600 py-10">Error: {error}</p>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{activities.map((act) => {
					const isEnrolled =
						user?.tipo === "alumno" &&
						act.alumnos_inscritos?.includes(user._id);
					return (
						<div
							key={act._id}
							className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-xl transition-shadow duration-300"
						>
							<div className="p-6 border-b border-gray-200">
								<h3 className="text-xl font-bold text-gray-900 mb-1">
									{act.titulo}
								</h3>
								<p className="text-sm text-gray-500">{act.descripcion}</p>
							</div>
							<div className="p-6 flex-grow">
								<div className="flex flex-wrap gap-2 mb-5">
									<span className="inline-block rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium">
										Profesor: {act.profesor?.nombre ?? "N/A"}
									</span>
									<span className="inline-block rounded-full bg-orange-100 text-orange-800 px-3 py-1 text-xs font-medium">
										Inicio: {new Date(act.fecha_inicio).toLocaleDateString()}
									</span>
								</div>

								{act.preguntas && act.preguntas.length > 0 && (
									<div className="mt-4 pt-4 border-t border-gray-200">
										<h6 className="text-sm font-semibold mb-3 text-gray-700">
											Comentarios:
										</h6>
										<div className="space-y-4">
											{act.preguntas.map((preg, index) => (
												<div
													key={preg._id}
													className={`text-sm ${index > 0 ? "border-t border-gray-100 pt-3 mt-3" : ""}`}
												>
													<p className="text-gray-800">
														<strong className="font-medium">
															{preg.alumno?.nombre ?? "Alumno"}:
														</strong>{" "}
														{preg.contenido}
													</p>

													{/* Mostrar botones para editar/eliminar si es el autor y aún no tiene respuesta */}
													{user?.tipo === "alumno" &&
														preg.alumno?._id === user._id &&
														!preg.respuesta_profesor && (
															<div className="mt-2 flex gap-2 text-sm">
																<button
																	onClick={() => {
																		setEditandoPreguntaId(preg._id);
																		setNuevoContenidoPregunta((prev) => ({
																			...prev,
																			[preg._id]: preg.contenido,
																		}));
																	}}
																	className="text-blue-600 hover:underline"
																>
																	Editar
																</button>
																<button
																	onClick={() => handleEliminarPregunta(act._id, preg._id)}
																	className="text-red-600 hover:underline"
																>
																	Eliminar
																</button>
															</div>
														)}

													{editandoPreguntaId === preg._id && (
														<div className="mt-2 pl-4">
															<textarea
																className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
																rows={2}
																value={nuevoContenidoPregunta[preg._id] || ""}
																onChange={(e) =>
																	setNuevoContenidoPregunta((prev) => ({
																		...prev,
																		[preg._id]: e.target.value,
																	}))
																}
															/>
															<div className="flex justify-end gap-2 mt-1">
																<button
																	onClick={() =>
																		handleGuardarEdicion(act._id, preg._id)
																	}
																	className="bg-orange-500 hover:bg-orange-600 text-white text-sm py-1 px-4 rounded"
																>
																	Guardar
																</button>
																<button
																	onClick={() => setEditandoPreguntaId(null)}
																	className="text-sm text-gray-500 hover:underline"
																>
																	Cancelar
																</button>
															</div>
														</div>
													)}



													{preg.respuesta_profesor && (
														<div className="mt-1 text-gray-600 pl-4">
															<p>
																<strong className="font-medium">Respuesta:</strong>{" "}
																{preg.respuesta_profesor}
															</p>

															{user?.tipo === "profesor" && act.profesor?._id === user._id && (
																<>
																	{editandoRespuestaId !== preg._id ? (
																		<div className="flex gap-4 mt-1">
																			<button
																				onClick={() => {
																					setEditandoRespuestaId(preg._id);
																					setNuevoContenidoRespuesta((prev) => ({
																						...prev,
																						[preg._id]: preg.respuesta_profesor || "",
																					}));
																				}}
																				className="text-sm text-blue-600 hover:underline"
																			>
																				Editar respuesta
																			</button>
																			<button
																				onClick={() => handleEliminarRespuesta(act._id, preg._id)}
																				className="text-sm text-red-600 hover:underline"
																			>
																				Eliminar respuesta
																			</button>
																		</div>
																	) : (
																		<div className="mt-2">
																			<textarea
																				className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
																				rows={2}
																				value={nuevoContenidoRespuesta[preg._id] || ""}
																				onChange={(e) =>
																					setNuevoContenidoRespuesta((prev) => ({
																						...prev,
																						[preg._id]: e.target.value,
																					}))
																				}
																			/>
																			<div className="flex justify-end gap-2 mt-2">
																				<button
																					onClick={() => handleGuardarEdicionRespuesta(act._id, preg._id)}
																					className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-4 rounded transition"
																				>
																					Guardar
																				</button>
																				<button
																					onClick={() => setEditandoRespuestaId(null)}
																					className="text-sm text-gray-500 hover:underline"
																				>
																					Cancelar
																				</button>
																			</div>
																		</div>
																	)}
																</>
															)}

														</div>
													)}




													{user?.tipo === "profesor" &&
														act.profesor?._id === user._id &&
														!preg.respuesta_profesor && (
															<div className="mt-2 pl-4">
																<textarea
																	className="w-full p-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
																	rows={2}
																	placeholder="Escribe tu respuesta..."
																	value={respuestasTexto[preg._id] || ""}
																	onChange={(e) =>
																		setRespuestasTexto((prev) => ({
																			...prev,
																			[preg._id]: e.target.value,
																		}))
																	}
																/>
																<button
																	onClick={() => handleResponder(act._id, preg._id)}
																	className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition"
																>
																	Responder
																</button>
															</div>
														)}

												</div>
											))}
										</div>
									</div>
								)}
							</div>
							{user?.tipo === "alumno" && act.alumnos_inscritos.includes(user._id) && (
								<div className="mt-4 border-t pt-4">
									<textarea
										className="w-full p-1  border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
										rows={2}
										placeholder="Escribe tu pregunta..."
										value={preguntasTexto[act._id] || ""}
										onChange={(e) =>
											setPreguntasTexto((prev) => ({
												...prev,
												[act._id]: e.target.value,
											}))
										}
									/>
									<button
										onClick={() => handlePregunta(act._id)}
										className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded-md transition"
									>
										Enviar pregunta
									</button>
								</div>
							)}


							<div className="p-6 bg-gray-50 border-t border-gray-200 mt-auto">
								{user?.tipo === "alumno" && (
									<button
										className={`w-full py-2.5 px-4 rounded-md font-semibold text-white shadow-md transition duration-300 ease-in-out ${isEnrolled ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600 transform hover:-translate-y-0.5"}`}
										onClick={() => !isEnrolled && handleInscribirse(act._id)}
										disabled={isEnrolled}
									>
										{isEnrolled ? "Ya Inscrito" : "Inscribirse en la Clase"}
									</button>
								)}

								{user?.tipo === "alumno" && isEnrolled && (
									<button
										className="mt-2 w-full py-2.5 px-4 rounded-md font-semibold text-orange-600 border border-orange-500 shadow-sm hover:bg-orange-50 transition"
										onClick={() => handleDesinscribirse(act._id)}
									>
										Desinscribirse
									</button>
								)}

								{user?.tipo === "profesor" && act.profesor?._id === user._id && (
									<button
										className="mt-2 w-full py-2.5 px-4 rounded-md font-semibold text-red-600 border border-red-500 shadow-sm hover:bg-red-50 transition"
										onClick={() => handleEliminarActividad(act._id)}
									>
										Eliminar Actividad
									</button>
								)}


								{user?.tipo !== "alumno" && (
									<p className="text-xs text-center text-gray-500">
										La inscripción es solo para alumnos.
									</p>
								)}
								{!user && (
									<p className="text-xs text-center text-gray-500">
										Inicia sesión como alumno para inscribirte.
									</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default AllInOne;
