package service;

import java.util.List;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import net.java.dualquizz.model.Question;

/**
 * Question REST Service
 * @licence http://www.gnu.org/licenses/agpl-3.0.html
 * @author bugeaud at gmail dot com
 */
@Stateless
@Path("net.java.dualquizz.question")
public class QuestionFacadeREST extends AbstractFacade<Question> {
    @PersistenceContext(unitName = "net.java.dualquizz_dualquiz_war_0.1-PU")
    private EntityManager em;

    public QuestionFacadeREST() {
        super(Question.class);
    }

    @POST
    @Override
    @Consumes({"application/xml", "application/json"})
    public void create(Question entity) {
        super.create(entity);
    }

    @PUT
    @Path("{id}")
    @Consumes({"application/xml", "application/json"})
    public void edit(@PathParam("id") String id, Question entity) {
        super.edit(entity);
    }

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("id") String id) {
        super.remove(super.find(id));
    }

    @GET
    @Path("{id}")
    @Produces({"application/xml", "application/json"})
    public Question find(@PathParam("id") String id) {
        return super.find(id);
    }

    @GET
    @Override
    @Produces({"application/xml", "application/json"})
    public List<Question> findAll() {
        return super.findAll();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({"application/xml", "application/json"})
    public List<Question> findRange(@PathParam("from") Integer from, @PathParam("to") Integer to) {
        return super.findRange(new int[]{from, to});
    }

    @GET
    @Path("count")
    @Produces("text/plain")
    public String countREST() {
        return String.valueOf(super.count());
    }

    @GET
    @Path("random")
    @Produces({"application/xml", "application/json"})
    public Question randomAll() {
        int index = (int)(Math.random()*super.count());
        // @todo This is not efficient but due to various issue in OGM this one 
        // Solution 1 KO : use a version that got $sample agragate working :
        //   db.Question.aggregate([{$sample: {size:1}}])
        //
        // Solution 2 KO : direct MongoDB query
        //   db.Question.find().limit(-1).skip(index).next()          
        List<Question> questions = findRange(index,index);
        return questions.get(0);
    }
    
    @GET
    @Path("random/{category: [a-zA-Z0-9]+}")
    @Produces({"application/xml", "application/json"})                                  
    public Question random(@PathParam("category") String category) {
        int index = (int)(Math.random()*countQuestionByCategory(category)); 
        final List<Question> questions = findRange(new int[]{index,index}, Question.KEY_QUESTION_SELECT_FROM_CATEGORY, category);
        return questions != null ? questions.get(0) : null;
    }
    
    private int countQuestionByCategory(String category){
        javax.persistence.Query q = getEntityManager().createNativeQuery("db.Question.count({'category' : '"+category+"' })");
        return ((Long) q.getSingleResult()).intValue();
    }

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
    
}
