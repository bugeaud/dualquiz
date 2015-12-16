package service;

import java.util.List;
import java.util.stream.Collectors;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import net.java.dualquizz.model.Proposal;
import net.java.dualquizz.model.Question;

/**
 * Question REST Service that provides sets of functionalities such as
 *  - Create Question (POST or GET)
 *  - Count Questions
 *  - Select a random question
 *  - Select a random question for a given category
 *  - Check if a answer is a correct answer of a given question (EJB call only)
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
    
    @GET
    @Path("new-question/{category}")
    @Produces({"application/json", "application/xml"})
    public Question newQuestion(@PathParam("category") String category,
                                @QueryParam("title") String title,
                                @QueryParam("description") String description,
                                @QueryParam("proposal") List<String> proposals,
                                @QueryParam("correct") List<String> correctProposals
                                ){
        final Question question = new Question();
        question.setTitle(title);
        question.setDescription(description);
        question.setCategory(category);
        
        // Now create the new question;
        getEntityManager().persist(question);
        
        final List<Proposal> proposalItems = proposals.stream()
            //.filter(p -> playerService.find(p)!=null )
            .map( label -> { 
                Proposal p = new Proposal();
                p.setLabel(label);
                p.setCorrect(correctProposals.contains(label));
                //getEntityManager().persist(p);
                return p;
            })
            .collect(Collectors.toList());  
        
        // Merge the newrelations 
        question.setProposals(proposalItems);
        getEntityManager().merge(question);
        
        return question;
    }
    
/*
    // Temporary disabled
    @PUT
    @Path("{id}")
    @Consumes({"application/xml", "application/json"})
    public void edit(@PathParam("id") String id, Question entity) {
        super.edit(entity);
    }
*/

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("id") String id) {
        super.remove(super.find(id));
    }

    @GET
    @Path("{id}")
    @Produces({"application/json", "application/xml" })
    public Question find(@PathParam("id") String id) {
        return super.find(id);
    }

    @GET
    @Override
    @Produces({"application/json", "application/xml" })
    public List<Question> findAll() {
        return super.findAll();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({"application/json", "application/xml" })
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
    @Produces({"application/json", "application/xml" })
    public Question randomAll() {
        int index = (int)(Math.random()*super.count());
        // @todo This is not efficient but due to various issue in OGM this one 
        // Solution 1 KO : use a version that got $sample agragate working :
        //   db.Question.aggregate([{$sample: {size:1}}])
        //
        // Solution 2 KO : direct MongoDB query
        //   db.Question.find().limit(-1).skip(index).next()          
        List<Question> questions = findRange(index,index);
        return questions != null && questions.size()>0 ? questions.get(0) : null;
    }
    
    @GET
    @Path("random/{category: [a-zA-Z0-9]+}")
    @Produces({"application/json", "application/xml" })
    public Question random(@PathParam("category") String category) {
        int index = (int)(Math.random()*countQuestionByCategory(category)); 
        final List<Question> questions = findRange(new int[]{index,index}, Question.KEY_QUESTION_SELECT_FROM_CATEGORY, category);
        return questions != null ? questions.get(0) : null;
    }
    
    private int countQuestionByCategory(String category){
        javax.persistence.Query q = getEntityManager().createNativeQuery("db.Question.count({'category' : '"+category+"' })");
        return ((Long) q.getSingleResult()).intValue();
    }

    public boolean isCorrectAnswer(String idQuestion, String idProposal){
        final Question question = find(idQuestion);
        if(question==null) return false;
        
        final List<Proposal> proposals = question.getProposals();
        if (proposals==null || proposals.size()<1) return false;
        // Filter all the proposal with only matching ones.
        // If more that 0 exists, this is a correct answer
        return (proposals.stream()
                    .filter(p -> p.isCorrect() && p.getId().equals(idProposal))
                    .collect(Collectors.counting())) > 0;            
    }    
    
    
    @Override
    protected EntityManager getEntityManager() {
        return em;
    }
    
}
